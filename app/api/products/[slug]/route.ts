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
  const product = await getExperience(slug);

  if (!product) {
    return NextResponse.json({ ok: false, message: "상품을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: product });
}
