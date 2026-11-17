import "server-only";
import { revalidatePath } from "next/cache";

/**
 * 관리자가 바꾼 내용을 고객 화면에 반영한다.
 * 홈과 상품·행사·저널·기획전 상세는 빌드 때 만들어 두는 정적 페이지라, 다시 만들라고 알려 주지 않으면
 * 다음 배포 전까지 예전 내용이 보인다. 변경이 드물어 전체를 한 번에 무효화한다.
 */
export function revalidateSite() {
  try {
    revalidatePath("/", "layout");
  } catch (error) {
    console.warn("Failed to revalidate site pages.", error);
  }
}
