import "server-only";
import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { adminError, parseRowId, requireAdmin } from "@/lib/admin/guard";
import { getPool, hasDatabaseConfig } from "@/lib/db";

/** 관리자 PATCH에서 받을 수 있는 필드 한 개의 규칙. 여기 없는 키는 무시한다. */
export type FieldSpec =
  | { column: string; kind: "text"; label: string; max: number; required?: boolean }
  | { column: string; kind: "int"; label: string; min?: number; nullable?: boolean }
  | { column: string; kind: "flag"; label: string }
  | { column: string; kind: "enum"; label: string; values: readonly string[] };

type Update = { sets: string[]; values: unknown[] };

/** payload에서 허용된 필드만 골라 `set` 절을 만든다. 잘못된 값이면 오류 문구를 돌려준다. */
export function buildUpdate(payload: Record<string, unknown>, specs: Record<string, FieldSpec>): Update | string {
  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [key, spec] of Object.entries(specs)) {
    const raw = payload[key];
    if (raw === undefined) continue;

    if (spec.kind === "text") {
      if (raw !== null && typeof raw !== "string") return `${spec.label} 형식이 올바르지 않습니다.`;
      const text = typeof raw === "string" ? raw.trim() : "";
      if (!text && spec.required) return `${spec.label}을(를) 입력해 주세요.`;
      if (text.length > spec.max) return `${spec.label}은(는) ${spec.max}자까지 입력할 수 있습니다.`;
      values.push(text || null);
    } else if (spec.kind === "int") {
      if (raw === null) {
        if (!spec.nullable) return `${spec.label}을(를) 입력해 주세요.`;
        values.push(null);
      } else {
        if (typeof raw !== "number" || !Number.isInteger(raw) || Math.abs(raw) > 2_000_000_000) {
          return `${spec.label}은(는) 정수로 입력해 주세요.`;
        }
        if (spec.min !== undefined && raw < spec.min) return `${spec.label}은(는) ${spec.min} 이상이어야 합니다.`;
        values.push(raw);
      }
    } else if (spec.kind === "flag") {
      if (typeof raw !== "boolean" && raw !== 0 && raw !== 1) return `${spec.label} 형식이 올바르지 않습니다.`;
      values.push(raw === true || raw === 1 ? 1 : 0);
    } else {
      if (typeof raw !== "string" || !spec.values.includes(raw)) return `지원하지 않는 ${spec.label}입니다.`;
      values.push(raw);
    }

    sets.push(`${spec.column} = ?`);
  }

  return { sets, values };
}

type PatchOptions = {
  /** 코드에 고정된 테이블 이름. 요청 값으로 만들지 않는다. */
  table: string;
  specs: Record<string, FieldSpec>;
  okMessage: string;
  sampleMessage: string;
  notFoundMessage: string;
  duplicateMessage?: string;
};

/** 허용 필드만 갱신하는 관리자 PATCH 공통 처리. 샘플 모드에서는 고정 응답을 유지한다. */
export async function patchRow(request: Request, rawId: string, payload: Record<string, unknown>, options: PatchOptions) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(adminOk(options.sampleMessage, { id: decodeURIComponent(rawId), payload }));
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const id = parseRowId(rawId);
  if (!id) return adminError("대상 번호가 올바르지 않습니다.", 400);

  const update = buildUpdate(payload, options.specs);
  if (typeof update === "string") return adminError(update, 400);
  if (!update.sets.length) return adminError("변경할 항목이 없습니다.", 400);

  try {
    const [rows] = await getPool().execute<{ id: number }[]>(
      `update ${options.table} set ${update.sets.join(", ")} where id = ? returning id`,
      [...update.values, id],
    );
    if (!rows.length) return adminError(options.notFoundMessage, 404);
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY" && options.duplicateMessage) {
      return adminError(options.duplicateMessage, 409);
    }
    throw error;
  }

  return NextResponse.json(adminOk(options.okMessage, { id }));
}

export async function readPayload(request: Request) {
  const payload = await request.json().catch(() => ({}));
  return payload && typeof payload === "object" && !Array.isArray(payload) ? (payload as Record<string, unknown>) : {};
}

type InsertOptions = {
  /** 코드에 고정된 테이블 이름. 요청 값으로 만들지 않는다. */
  table: string;
  specs: Record<string, FieldSpec>;
  /** specs 밖에서 서버가 정하는 컬럼 값(예: 만든 slug). */
  extra?: Record<string, unknown>;
  okMessage: string;
  duplicateMessage: string;
};

/** 허용 필드만으로 새 행을 만드는 관리자 POST 공통 처리. 호출 전에 샘플 모드·권한 확인을 끝내야 한다. */
export async function insertRow(payload: Record<string, unknown>, options: InsertOptions) {
  for (const [key, spec] of Object.entries(options.specs)) {
    if (spec.kind === "text" && spec.required && payload[key] === undefined) {
      return adminError(`${spec.label}을(를) 입력해 주세요.`, 400);
    }
  }

  const update = buildUpdate(payload, options.specs);
  if (typeof update === "string") return adminError(update, 400);

  const columns = update.sets.map((set) => set.replace(" = ?", ""));
  const values = [...update.values];
  for (const [column, value] of Object.entries(options.extra ?? {})) {
    columns.push(column);
    values.push(value);
  }
  if (!columns.length) return adminError("저장할 내용이 없습니다.", 400);

  try {
    const [rows] = await getPool().execute<{ id: number }[]>(
      `insert into ${options.table} (${columns.join(", ")}) values (${columns.map(() => "?").join(", ")}) returning id`,
      values,
    );
    return NextResponse.json(adminOk(options.okMessage, { id: rows[0]?.id }), { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") return adminError(options.duplicateMessage, 409);
    throw error;
  }
}

/** 제목에서 URL용 slug를 만든다. 영문·숫자만 남기고, 남는 게 없으면(한글 제목 등) 접두사+시각으로 대신한다. */
export function makeSlug(value: unknown, prefix: string) {
  const base =
    typeof value === "string"
      ? value
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 100)
      : "";
  return base || `${prefix}-${Date.now().toString(36)}`;
}

/** 외부 수단이 없어 저장할 수 없는 동작의 응답. 저장된 것처럼 보이지 않게 501로 알린다. */
export function notLinked(reason: string) {
  return adminError(`아직 연결되지 않은 기능입니다. ${reason}`, 501);
}

export function isDateString(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}
