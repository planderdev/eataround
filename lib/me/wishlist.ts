import "server-only";
import type { RowDataPacket } from "@/lib/db";
import { getPool } from "@/lib/db";
import { experiencePath } from "@/lib/routes";
import type { WishlistItem } from "@/types/api";

type WishlistRow = RowDataPacket & {
  slug: string;
  title: string;
  region: string;
  price: number;
  badge: string | null;
  image_url: string | null;
};

/** 회원의 찜 목록. 숨긴 상품은 목록에서 뺀다(다시 노출하면 돌아온다). */
export async function listMyWishlist(userId: number): Promise<WishlistItem[]> {
  const [rows] = await getPool().query<WishlistRow[]>(
    `select p.slug, p.title, p.region, p.price, p.badge, p.image_url
       from wishlists w
       join products p on p.id = w.product_id
      where w.user_id = ? and p.is_visible = 1
      order by w.created_at desc
      limit 200`,
    [userId],
  );
  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    region: row.region,
    price: `${row.price.toLocaleString("ko-KR")}원`,
    badge: row.badge ?? "",
    href: experiencePath(row.slug),
    image: row.image_url ?? "",
  }));
}

/** 찜 저장·해제. 없는 상품이면 null. */
export async function setWishlist(userId: number, slug: string, saved: boolean): Promise<boolean | null> {
  const pool = getPool();
  const [products] = await pool.query<(RowDataPacket & { id: number })[]>(
    "select id from products where slug = ? and is_visible = 1 limit 1",
    [slug],
  );
  const product = products[0];
  if (!product) return null;

  if (saved) {
    await pool.execute(
      "insert into wishlists (user_id, product_id) values (?, ?) on conflict (user_id, product_id) do nothing",
      [userId, product.id],
    );
  } else {
    await pool.execute("delete from wishlists where user_id = ? and product_id = ?", [userId, product.id]);
  }
  return saved;
}
