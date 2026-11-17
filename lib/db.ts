import { Pool, types, type PoolClient } from "pg";

// Supabase(Postgres) 연결 계층.
// 기존 mysql2 호출부(`const [rows] = await pool.query(sql, [..])`, `?` 플레이스홀더)를
// 그대로 쓸 수 있도록 같은 모양의 얇은 래퍼를 제공한다.

/** 기존 Row 타입 선언(`RowDataPacket & {...}`)을 유지하기 위한 호환 타입 */
export type RowDataPacket = object;

type QueryParams = readonly unknown[];

export type DbConnection = {
  query<T = RowDataPacket[]>(sql: string, params?: QueryParams): Promise<[T]>;
  execute<T = RowDataPacket[]>(sql: string, params?: QueryParams): Promise<[T]>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
};

export type DbPool = Pick<DbConnection, "query" | "execute"> & {
  getConnection(): Promise<DbConnection>;
};

// bigint(id, count) → number, numeric → number, date → 'YYYY-MM-DD' 문자열(타임존 밀림 방지)
types.setTypeParser(20, (value) => Number(value));
types.setTypeParser(1700, (value) => Number(value));
types.setTypeParser(1082, (value) => value);

// 호출부가 검사하는 MySQL 오류 코드로 변환
const ERROR_CODE_MAP: Record<string, string> = {
  "23505": "ER_DUP_ENTRY", // unique_violation
  "42703": "ER_BAD_FIELD_ERROR", // undefined_column
};

function toPositional(sql: string) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function translateError(error: unknown) {
  const pgCode = (error as { code?: string } | null)?.code;
  if (error && pgCode && ERROR_CODE_MAP[pgCode]) {
    (error as { code?: string }).code = ERROR_CODE_MAP[pgCode];
  }
  return error;
}

type Runner = Pick<Pool | PoolClient, "query">;

async function run<T>(runner: Runner, sql: string, params: QueryParams = []): Promise<[T]> {
  try {
    const result = await runner.query(toPositional(sql), params as unknown[]);
    return [result.rows as T];
  } catch (error) {
    throw translateError(error);
  }
}

function getConnectionString() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

// 개발 모드에서는 라우트마다 모듈이 따로 로드되므로 전역에 한 번만 만든다.
const globalForDb = globalThis as typeof globalThis & { __eataroundPgPool?: Pool };

function getPgPool() {
  if (globalForDb.__eataroundPgPool) return globalForDb.__eataroundPgPool;

  const connectionString = getConnectionString();
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);

  const pgPool = new Pool({
    connectionString,
    // Supabase 풀러(Supavisor) 인증서는 기본 CA 번들에 없어 검증을 끈다. 전송 구간 암호화는 유지된다.
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    // 서버리스(Fluid Compute) 인스턴스당 연결 수를 작게 유지한다. 풀러(6543) 사용 전제.
    max: Number(process.env.DB_POOL_MAX ?? 5),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  // 유휴 연결이 끊겨도 프로세스가 죽지 않게 한다. 다음 쿼리에서 새 연결을 맺는다.
  pgPool.on("error", (error) => {
    console.warn("Database pool connection error.", error.message);
  });

  globalForDb.__eataroundPgPool = pgPool;
  return pgPool;
}

export function getPool(): DbPool {
  const pool = getPgPool();

  return {
    query: (sql, params) => run(pool, sql, params),
    execute: (sql, params) => run(pool, sql, params),
    async getConnection() {
      const client = await pool.connect();
      return {
        query: (sql, params) => run(client, sql, params),
        execute: (sql, params) => run(client, sql, params),
        async beginTransaction() {
          await client.query("begin");
        },
        async commit() {
          await client.query("commit");
        },
        async rollback() {
          await client.query("rollback");
        },
        release() {
          client.release();
        },
      };
    },
  };
}

export function hasDatabaseConfig() {
  return Boolean(getConnectionString());
}
