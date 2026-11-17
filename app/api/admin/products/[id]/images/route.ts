import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { GALLERY_MAX_IMAGES, parseImageUrl } from "@/lib/admin/gallery";
import { adminError, parseRowId, requireAdmin, trimmed } from "@/lib/admin/guard";
import { readPayload } from "@/lib/admin/patch";
import { revalidateSite } from "@/lib/admin/revalidate";
import { getPool, hasDatabaseConfig } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ImageRow = { id: number; image_url: string; alt: string | null; sort_order: number };

// 상품 갤러리(상품 한 개에 사진 여러 장).
// 파일 자체는 `/api/admin/uploads` 토큰으로 브라우저가 Vercel Blob에 직접 올리고, 여기에는 그 결과 주소만 저장한다.

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!hasDatabaseConfig()) return NextResponse.json({ ok: true, items: [] });

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const productId = parseRowId(id);
  if (!productId) return adminError("상품 번호가 올바르지 않습니다.", 400);

  const [rows] = await getPool().query<ImageRow[]>(
    "select id, image_url, alt, sort_order from product_images where product_id = ? order by sort_order asc, id asc",
    [productId],
  );
  return NextResponse.json({
    ok: true,
    items: rows.map((row) => ({ id: row.id, imageUrl: row.image_url, alt: row.alt ?? "", sortOrder: row.sort_order })),
  });
}

/** 갤러리에 사진 한 장을 추가한다. `primary: true`면 상품 대표 이미지로도 지정한다. */
export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = await readPayload(request);

  if (!hasDatabaseConfig()) {
    return NextResponse.json(adminOk("상품 이미지가 등록되었습니다.", { id: decodeURIComponent(id), payload }), { status: 201 });
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const productId = parseRowId(id);
  if (!productId) return adminError("상품 번호가 올바르지 않습니다.", 400);

  const imageUrl = parseImageUrl(payload.imageUrl);
  if (!imageUrl) return adminError("이미지 주소(imageUrl)를 500자 이하의 http(s) 주소로 보내 주세요.", 400);
  if (payload.alt !== undefined && payload.alt !== null && typeof payload.alt !== "string") {
    return adminError("사진 설명 형식이 올바르지 않습니다.", 400);
  }
  const alt = trimmed(payload.alt, 200);

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();

    // 동시에 올려도 장수 상한을 넘지 않도록 상품 행을 잠그고 센다.
    const [products] = await connection.query<{ id: number }[]>("select id from products where id = ? for update", [productId]);
    if (!products.length) {
      await connection.rollback();
      return adminError("상품을 찾을 수 없습니다.", 404);
    }

    const [counts] = await connection.query<{ total: number; next_order: number }[]>(
      "select count(*) as total, coalesce(max(sort_order), 0) + 1 as next_order from product_images where product_id = ?",
      [productId],
    );
    if (Number(counts[0].total) >= GALLERY_MAX_IMAGES) {
      await connection.rollback();
      return adminError(`갤러리에는 상품당 ${GALLERY_MAX_IMAGES}장까지 넣을 수 있습니다. 사진을 지운 뒤 다시 올려 주세요.`, 409);
    }

    const [rows] = await connection.execute<{ id: number }[]>(
      "insert into product_images (product_id, image_url, alt, sort_order) values (?, ?, ?, ?) returning id",
      [productId, imageUrl, alt, Number(counts[0].next_order)],
    );
    if (payload.primary === true) {
      await connection.execute("update products set image_url = ? where id = ?", [imageUrl, productId]);
    }

    await connection.commit();
    revalidateSite();
    return NextResponse.json(adminOk("갤러리에 사진을 추가했습니다.", { id: rows[0].id }), { status: 201 });
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }
}

/** 갤러리 순서를 바꾼다. `order`에 이 상품의 사진 id를 원하는 순서대로 모두 보낸다. */
export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = await readPayload(request);

  if (!hasDatabaseConfig()) {
    return NextResponse.json(adminOk("갤러리 순서를 저장했습니다.", { id: decodeURIComponent(id), payload }));
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const productId = parseRowId(id);
  if (!productId) return adminError("상품 번호가 올바르지 않습니다.", 400);

  const order = Array.isArray(payload.order) ? payload.order : null;
  if (
    !order ||
    !order.length ||
    order.length > GALLERY_MAX_IMAGES ||
    !order.every((value) => typeof value === "number" && Number.isInteger(value) && value > 0) ||
    new Set(order).size !== order.length
  ) {
    return adminError("순서(order)는 사진 번호를 중복 없이 나열한 목록이어야 합니다.", 400);
  }

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<{ id: number }[]>(
      "select id from product_images where product_id = ? order by id asc for update",
      [productId],
    );
    const existing = new Set(rows.map((row) => row.id));
    if (!rows.length) {
      await connection.rollback();
      return adminError("이 상품에는 갤러리 사진이 없습니다.", 404);
    }
    if (existing.size !== order.length || !order.every((value) => existing.has(value as number))) {
      await connection.rollback();
      return adminError("순서 목록이 이 상품의 갤러리 사진과 맞지 않습니다. 화면을 새로 고친 뒤 다시 시도해 주세요.", 409);
    }

    for (const [index, imageId] of order.entries()) {
      await connection.execute("update product_images set sort_order = ? where id = ? and product_id = ?", [index + 1, imageId, productId]);
    }

    await connection.commit();
    revalidateSite();
    return NextResponse.json(adminOk("갤러리 순서를 저장했습니다.", { id: productId }));
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }
}
