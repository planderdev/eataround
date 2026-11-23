import { AsyncLocalStorage } from "node:async_hooks";

// 관리자 화면 안에서는 DB 조회가 실패해도 샘플 데이터로 바꾸지 않는다.
// 운영자가 가짜 예약·회원을 실제 데이터로 오해하지 않게 오류 화면을 보인다.
const strictDatabase = new AsyncLocalStorage<boolean>();

export function withStrictDatabase<T>(run: () => Promise<T>) {
  return strictDatabase.run(true, run);
}

export function isStrictDatabase() {
  return strictDatabase.getStore() === true;
}
