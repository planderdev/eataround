"use client";

import { RiArrowDownSLine } from "@remixicon/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SortOption = {
  label: string;
  value: string;
};

type SortSelectProps = {
  label: string;
  name?: string;
  options: SortOption[];
  value: string;
};

export function SortSelect({ label, name = "sort", options, value }: SortSelectProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (nextValue === options[0]?.value) {
      params.delete(name);
    } else {
      params.set(name, nextValue);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <label className="select-control">
      <span className="sr-only">{label}</span>
      <select aria-label={label} value={value} onChange={(event) => handleChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <RiArrowDownSLine size={18} />
    </label>
  );
}
