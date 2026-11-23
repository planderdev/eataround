import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { adminError, parseRowId, requireAdmin } from "@/lib/admin/guard";
import {
  DETAIL_TYPES,
  PRODUCT_TEXT_FIELDS,
  normalizeDetailItems,
  normalizeProductFields,
  type DetailItem,
  type ProductTextFields,
  type ProductTextKey,
} from "@/lib/admin/product-details";
import { revalidateSite } from "@/lib/admin/revalidate";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type DetailRow = RowDataPacket & {
  content_type: DetailItem["type"];
  label: string | null;
  body: string;
  meta: string | null;
  note: string | null;
};

const FIELD_ENTRIES = Object.entries(PRODUCT_TEXT_FIELDS) as [ProductTextKey, (typeof PRODUCT_TEXT_FIELDS)[ProductTextKey]][];

type Queryable = Pick<ReturnType<typeof getPool>, "query">;

/** 상품의 소개 칸과 상세 항목을 읽는다. 없는 상품이면 null. */
async function readDetailState(db: Queryable, productId: number) {
  const [products] = await db.query<(RowDataPacket & Record<string, string | null>)[]>(
    `select ${FIELD_ENTRIES.map(([, spec]) => spec.column).join(", ")} from products where id = ? limit 1`,
    [productId],
  );
  const product = products[0];
  if (!product) return null;

  const [rows] = await db.query<DetailRow[]>(
    `select content_type, label, body, meta, note
       from product_detail_items
      where product_id = ?
      order by sort_order asc, id asc`,
    [productId],
  );

  const fields: ProductTextFields = {};
  for (const [key, spec] of FIELD_ENTRIES) fields[key] = product[spec.column] ?? "";
  const items: DetailItem[] = rows
    .filter((row) => DETAIL_TYPES.includes(row.content_type))
    .map((row) => ({
      type: row.content_type,
      label: row.label ?? undefined,
      body: row.body,
      meta: row.meta ?? undefined,
      note: row.note ?? undefined,
    }));
  return { items, fields, version: versionOf(items, fields) };
}

/** 편집기가 연 뒤 다른 관리자가 고쳤는지 알기 위한 내용 지문. */
function versionOf(items: DetailItem[], fields: ProductTextFields) {
  return createHash("sha256").update(JSON.stringify({ items, fields })).digest("hex").slice(0, 16);
}

/** 상품 상세 항목과 소개 칸을 읽는다(편집기가 열릴 때). */
export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!hasDatabaseConfig()) return NextResponse.json({ ok: true, live: false, items: [], fields: {} });

  const denied = await requireAdmin(request);
  if (denied) return denied;
  const productId = parseRowId(id);
  if (!productId) return adminError("상품 번호가 올바르지 않습니다.", 400);

  const state = await readDetailState(getPool(), productId);
  if (!state) return adminError("상품을 찾을 수 없습니다.", 404);
  return NextResponse.json({ ok: true, live: true, ...state });
}

/** 상세 항목 전체를 받은 목록으로 바꾸고(순서 포함), 보낸 소개 칸만 고친다. */
export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = ((await request.json().catch(() => ({}))) ?? {}) as { items?: unknown; fields?: unknown; version?: unknown };

  const items = payload.items === undefined ? undefined : normalizeDetailItems(payload.items);
  if (typeof items === "string") return adminError(items, 400);
  const fields = normalizeProductFields(payload.fields);
  if (typeof fields === "string") return adminError(fields, 400);
  if (items === undefined && !Object.keys(fields).length) return adminError("저장할 내용이 없습니다.", 400);

  if (!hasDatabaseConfig()) return NextResponse.json(adminOk("상세 내용을 저장했습니다.", { id: decodeURIComponent(id) }));

  const denied = await requireAdmin(request);
  if (denied) return denied;
  const productId = parseRowId(id);
  if (!productId) return adminError("상품 번호가 올바르지 않습니다.", 400);

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    // 같은 상품을 두 사람이 동시에 저장해도 항목이 섞이지 않게 상품 행을 잠근다.
    const [locked] = await connection.query<(RowDataPacket & { id: number })[]>("select id from products where id = ? for update", [productId]);
    if (!locked[0]) {
      await connection.rollback();
      return adminError("상품을 찾을 수 없습니다.", 404);
    }
    // 편집기를 연 뒤 다른 관리자가 먼저 저장했으면 덮어쓰지 않는다.
    const current = await readDetailState(connection, productId);
    if (typeof payload.version !== "string" || !current || current.version !== payload.version) {
      await connection.rollback();
      return adminError("편집기를 연 뒤 다른 곳에서 상세 내용이 바뀌었습니다. 편집기를 닫았다가 다시 열어 최신 내용으로 고쳐 주세요.", 409);
    }

    const keys = Object.keys(fields) as ProductTextKey[];
    if (keys.length) {
      await connection.execute(
        `update products set ${keys.map((key) => `${PRODUCT_TEXT_FIELDS[key].column} = ?`).join(", ")} where id = ?`,
        // 빈 칸은 null로 비운다(지역·카테고리는 위에서 빈 값을 막았다).
        [...keys.map((key) => fields[key] || null), productId],
      );
    }

    if (items) {
      await connection.execute("delete from product_detail_items where product_id = ?", [productId]);
      const order = new Map<string, number>();
      for (const item of items) {
        const sortOrder = order.get(item.type) ?? 0;
        order.set(item.type, sortOrder + 1);
        await connection.execute(
          `insert into product_detail_items (product_id, content_type, label, body, meta, note, sort_order)
           values (?, ?, ?, ?, ?, ?, ?)`,
          [productId, item.type, item.label || null, item.body, item.meta || null, item.note || null, sortOrder],
        );
      }
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }

  revalidateSite();
  const saved = await readDetailState(getPool(), productId);
  return NextResponse.json({
    ...adminOk("상세 내용을 저장했습니다. 상품 상세 화면에 바로 반영됩니다.", { id: productId }),
    version: saved?.version,
    items: saved?.items,
    fields: saved?.fields,
  });
}
