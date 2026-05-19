export function formatWon(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getStockText(capacity: number, booked: number) {
  const remain = Math.max(capacity - booked, 0);
  if (remain === 0) return "마감";
  if (remain <= 3) return `${remain}자리 남음`;
  return `${remain}명 예약 가능`;
}

export function getTeamStockText(maxTeams?: number, reservedTeams?: number) {
  if (!maxTeams) return "팀 재고 문의";
  const remain = Math.max(maxTeams - (reservedTeams ?? 0), 0);
  if (remain === 0) return "팀 마감";
  return `${remain}팀 예약 가능`;
}
