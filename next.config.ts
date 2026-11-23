import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const isCafe24Export = process.env.CAFE24_EXPORT === "1";
// 회원 화면(브라우저)이 예시 데이터를 쓸지. 값을 따로 주지 않으면 서버와 같은 기준(DB 연결 여부)으로 정한다.
// 서버 API·마이페이지 첫 화면은 DB가 있으면 실제 데이터를 쓰므로, 브라우저만 예시 데이터를 쓰면
// 찜·후기·취소가 저장되지 않은 채 성공으로 보인다.
const hasDatabase = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
const useMock = process.env.NEXT_PUBLIC_USE_MOCK || (hasDatabase ? "false" : "true");

const nextConfig: NextConfig = {
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
  ...(isCafe24Export
    ? {
        output: "export" as const,
        trailingSlash: true,
      }
    : {}),
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_USE_MOCK: useMock,
  },
};

export default nextConfig;
