import { createHmac, timingSafeEqual } from "node:crypto";

// 서명된 세션 토큰. 형식: v1.<payload(base64url JSON)>.<HMAC-SHA256(base64url)>
// 쿠키 값만으로는 위조할 수 없도록 SESSION_SECRET으로 서명하고, 만료 시각을 함께 담는다.

const TOKEN_VERSION = "v1";
// DB가 연결되지 않은 샘플 모드 전용. 실제 회원 데이터가 없을 때만 쓰인다.
const SAMPLE_MODE_SECRET = "eataround-sample-mode-only";

export type SessionRole = "user" | "admin";

export type SessionTokenPayload = {
  email: string;
  /** 발급 시점의 권한. 페이지 접근 분기에만 쓰고, 데이터 접근 권한은 DB의 role로 다시 확인한다. */
  role: SessionRole;
  /** 만료 시각 (epoch seconds) */
  exp: number;
};

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

/** 서명 키. DB가 연결된 환경에서 SESSION_SECRET이 없거나 짧으면 null (세션을 발급·인정하지 않는다). */
function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  return hasDatabase() ? null : SAMPLE_MODE_SECRET;
}

export function isSessionSigningReady() {
  return getSecret() !== null;
}

function sign(body: string, secret: string) {
  return createHmac("sha256", secret).update(`${TOKEN_VERSION}.${body}`).digest("base64url");
}

export function createSessionToken(email: string, maxAgeSeconds: number, role: SessionRole = "user") {
  const secret = getSecret();
  if (!secret) throw new Error("SESSION_SECRET is not configured (32자 이상 필요).");

  const payload: SessionTokenPayload = { email, role, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${TOKEN_VERSION}.${body}.${sign(body, secret)}`;
}

/** 서명과 만료를 확인하고 payload를 돌려준다. 하나라도 맞지 않으면 null */
export function verifySessionToken(token: string | undefined | null): SessionTokenPayload | null {
  const secret = getSecret();
  if (!secret || !token) return null;

  const [version, body, signature, ...rest] = token.split(".");
  if (version !== TOKEN_VERSION || !body || !signature || rest.length) return null;

  const expected = Buffer.from(sign(body, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Partial<SessionTokenPayload>;
    if (typeof payload.email !== "string" || !payload.email) return null;
    if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return { email: payload.email, role: payload.role === "admin" ? "admin" : "user", exp: payload.exp };
  } catch {
    return null;
  }
}
