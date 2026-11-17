import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { adminError, parseRowId, requireAdmin, trimmed } from "@/lib/admin/guard";
import { readPayload } from "@/lib/admin/patch";
import { revalidateSite } from "@/lib/admin/revalidate";
import { getPool, hasDatabaseConfig } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string; imageId: string }>;
};

/** 갤러리 사진 한 장의 설명을 고치거나(`alt`), 상품 대표 이미지로 지정한다(`primary: true`). */
export async function PATCH(request: Request, { params }: RouteContext) {
  const { id, imageId } = await params;
  const payload = await readPayload(request);

  if (!hasDatabaseConfig()) {
    return NextResponse.json(adminOk("갤러리 사진을 저장했습니다.", { id: decodeURIComponent(imageId), payload }));
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const productId = parseRowId(id);
  const rowId = parseRowId(imageId);
  if (!productId || !rowId) return adminError("상품 또는 사진 번호가 올바르지 않습니다.", 400);

  const hasAlt = payload.alt !== undefined;
  const makePrimary = payload.primary === true;
  if (!hasAlt && !makePrimary) return adminError("변경할 항목이 없습니다.", 400);
  if (hasAlt && payload.alt !== null && typeof payload.alt !== "string") return adminError("사진 설명 형식이 올바르지 않습니다.", 400);
  if (typeof payload.alt === "string" && payload.alt.trim().length > 200) return adminError("사진 설명은 200자까지 입력할 수 있습니다.", 400);

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<{ id: number; image_url: string }[]>(
      "select id, image_url from product_images where id = ? and product_id = ? for update",
      [rowId, productId],
    );
    const image = rows[0];
    if (!image) {
      await connection.rollback();
      return adminError("갤러리 사진을 찾을 수 없습니다.", 404);
    }

    if (hasAlt) await connection.execute("update product_images set alt = ? where id = ?", [trimmed(payload.alt, 200), rowId]);
    // 대표 이미지는 products.image_url에 둔다. 갤러리 사진의 주소를 그대로 복사한다.
    if (makePrimary) await connection.execute("update products set image_url = ? where id = ?", [image.image_url, productId]);

    await connection.commit();
    revalidateSite();
    return NextResponse.json(adminOk(makePrimary ? "대표 이미지로 지정했습니다." : "사진 설명을 저장했습니다.", { id: rowId }));
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 갤러리에서 사진을 뺀다. DB 행만 지우고 저장소(Blob)의 파일은 지우지 않는다.
 * 같은 주소가 상품 대표 이미지나 다른 상품·배너에 쓰이고 있을 수 있고, 외부 주소일 수도 있기 때문이다.
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  const { id, imageId } = await params;

  if (!hasDatabaseConfig()) {
    return NextResponse.json(adminOk("갤러리에서 사진을 뺐습니다.", { id: decodeURIComponent(imageId) }));
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const productId = parseRowId(id);
  const rowId = parseRowId(imageId);
  if (!productId || !rowId) return adminError("상품 또는 사진 번호가 올바르지 않습니다.", 400);

  const [rows] = await getPool().execute<{ id: number }[]>(
    "delete from product_images where id = ? and product_id = ? returning id",
    [rowId, productId],
  );
  if (!rows.length) return adminError("갤러리 사진을 찾을 수 없습니다.", 404);

  revalidateSite();
  return NextResponse.json(adminOk("갤러리에서 사진을 뺐습니다.", { id: rowId }));
}
