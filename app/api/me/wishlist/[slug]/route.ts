import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  return NextResponse.json({ saved: true, slug: decodeURIComponent(slug) });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  return NextResponse.json({ saved: false, slug: decodeURIComponent(slug) });
}
