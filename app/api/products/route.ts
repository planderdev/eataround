import { NextResponse } from "next/server";
import { getExperiences } from "@/lib/content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const category = searchParams.get("category");
  const products = await getExperiences();

  return NextResponse.json({
    ok: true,
    items: products.filter((product) => {
      if (region && product.region !== region) return false;
      if (category && product.category !== category && !product.tags.includes(category)) return false;
      return true;
    }),
  });
}
