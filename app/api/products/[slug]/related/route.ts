import { NextResponse } from "next/server";
import { getExperience, getExperiences } from "@/lib/content";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getExperiences();
  return products.map((product) => ({ slug: product.slug }));
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getExperience(slug), getExperiences()]);

  if (!product) {
    return NextResponse.json({ ok: false, message: "상품을 찾을 수 없습니다." }, { status: 404 });
  }

  const items = products
    .filter((item) => item.slug !== slug)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 4);

  return NextResponse.json({ ok: true, items });
}
