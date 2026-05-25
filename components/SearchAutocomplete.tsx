"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RiCloseLine, RiFireLine, RiHistoryLine, RiSearchLine } from "@remixicon/react";
import { userRoutes } from "@/lib/routes";

const RECENT_KEY = "search:recent";
const MAX_RECENT = 6;
const MAX_MATCHES = 6;

type SuggestionItem = {
  label: string;
  group: "experience" | "event" | "journal";
};

type SearchAutocompleteProps = {
  defaultValue: string;
  activeType: "all" | "experience" | "event" | "journal";
  suggestionPool: SuggestionItem[];
  trendingKeywords?: string[];
};

const groupLabel: Record<SuggestionItem["group"], string> = {
  experience: "체험",
  event: "행사",
  journal: "저널",
};

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeRecent(items: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {
    // ignore quota errors
  }
}

export function SearchAutocomplete({ activeType, defaultValue, suggestionPool, trendingKeywords = [] }: SearchAutocompleteProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return [];
    const seen = new Set<string>();
    const result: SuggestionItem[] = [];
    for (const item of suggestionPool) {
      const key = item.label.toLowerCase();
      if (seen.has(key)) continue;
      if (!key.includes(query)) continue;
      seen.add(key);
      result.push(item);
      if (result.length >= MAX_MATCHES) break;
    }
    return result;
  }, [suggestionPool, value]);

  function navigate(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;

    const next = [trimmed, ...recent.filter((item) => item !== trimmed)].slice(0, MAX_RECENT);
    setRecent(next);
    writeRecent(next);
    setFocused(false);

    const params = new URLSearchParams({ q: trimmed });
    if (activeType !== "all") params.set("type", activeType);
    router.push(`${userRoutes.search}?${params.toString()}`);
  }

  function removeRecent(item: string) {
    const next = recent.filter((entry) => entry !== item);
    setRecent(next);
    writeRecent(next);
  }

  function clearAllRecent() {
    setRecent([]);
    writeRecent([]);
  }

  const showSuggestions = focused;
  const hasMatches = matches.length > 0;
  const hasRecent = recent.length > 0;
  const hasTrending = trendingKeywords.length > 0;

  return (
    <div className="search-autocomplete" ref={wrapperRef}>
      <form
        className="search-panel"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(value);
        }}
      >
        <label className="search-input-wrap">
          <RiSearchLine size={22} />
          <span className="sr-only">검색어</span>
          <input
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            autoComplete="off"
            name="q"
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="어떤 로컬 경험을 찾고 있나요?"
            type="search"
            value={value}
          />
        </label>
        {activeType !== "all" ? <input name="type" type="hidden" value={activeType} /> : null}
        <button className="primary-button search-submit" type="submit">
          검색
        </button>
      </form>

      {showSuggestions ? (
        <div className="search-suggestions" role="listbox">
          {hasMatches ? (
            <section className="search-suggestion-section">
              <header>
                <strong>추천 결과</strong>
              </header>
              <ul>
                {matches.map((match) => (
                  <li key={`${match.group}-${match.label}`}>
                    <button onClick={() => navigate(match.label)} type="button">
                      <span>{match.label}</span>
                      <small>{groupLabel[match.group]}</small>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {!value.trim() && hasRecent ? (
            <section className="search-suggestion-section">
              <header>
                <strong>
                  <RiHistoryLine size={14} />
                  최근 검색어
                </strong>
                <button className="search-suggestion-clear" onClick={clearAllRecent} type="button">
                  전체 삭제
                </button>
              </header>
              <ul>
                {recent.map((item) => (
                  <li key={item}>
                    <button onClick={() => navigate(item)} type="button">
                      <span>{item}</span>
                    </button>
                    <button aria-label={`${item} 삭제`} className="search-suggestion-remove" onClick={() => removeRecent(item)} type="button">
                      <RiCloseLine size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {!value.trim() && hasTrending ? (
            <section className="search-suggestion-section">
              <header>
                <strong>
                  <RiFireLine size={14} />
                  추천 키워드
                </strong>
              </header>
              <div className="search-suggestion-chips">
                {trendingKeywords.map((keyword) => (
                  <button className="filter-chip" key={keyword} onClick={() => navigate(keyword)} type="button">
                    {keyword}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {!hasMatches && !hasRecent && !hasTrending && !value.trim() ? (
            <p className="search-suggestion-empty">검색어를 입력해 보세요.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
