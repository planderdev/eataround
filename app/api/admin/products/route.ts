import { NextResponse } from "next/server";
import { adminApiData, paginated } from "@/lib/admin/api-data";
import { getExperiences } from "@/lib/content";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { getAdminSessionUser } from "@/lib/session";

type ProductPayload = {
  slug?: string;
  title?: string;
  summary?: string;
  description?: string;
  region?: string;
  category?: string;
  price?: number;
  originalPrice?: number;
  duration?: string;
  badge?: string;
  imageUrl?: string;
};

function normalize(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET(request: Request) {
  const products = await getExperiences();
  return NextResponse.json({
    ...paginated(request, adminApiData.products),
    products,
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ProductPayload;
  const slug = normalize(payload.slug);
  const title = normalize(payload.title);
  const region = normalize(payload.region);
  const category = normalize(payload.category);
  const price = Number(payload.price ?? 0);

  if (!slug || !title || !region || !category || price <= 0) {
    return NextResponse.json(
      { ok: false, message: "slug, title, region, category, price는 필수입니다." },
      { status: 400 },
    );
  }

  if (!hasDatabaseConfig()) {
    return NextResponse.json({
      ok: true,
      message: "상품 생성 요청을 확인했습니다.",
    });
  }

  if (!(await getAdminSessionUser(request))) {
    return NextResponse.json({ ok: false, message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const pool = getPool();
  await pool.execute(
    `insert into products
      (slug, title, summary, description, region, category, price, original_price, duration, badge, image_url)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug,
      title,
      normalize(payload.summary),
      normalize(payload.description),
      region,
      category,
      price,
      payload.originalPrice ?? null,
      normalize(payload.duration),
      normalize(payload.badge),
      normalize(payload.imageUrl),
    ],
  );

  return NextResponse.json({ ok: true, message: "상품이 저장되었습니다." }, { status: 201 });
}
