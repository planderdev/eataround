"use client";

import { RiPrinterLine } from "@remixicon/react";

export function QuotePrintButton() {
  return (
    <button className="admin-action-button primary print-hidden" onClick={() => window.print()} type="button">
      <RiPrinterLine size={16} />
      인쇄하기
    </button>
  );
}
