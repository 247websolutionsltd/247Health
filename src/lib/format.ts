const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// All formatting is done by hand rather than with Intl so the output is identical on iOS, Android and web.
// Times are shown in the device's local time zone.

/** "Fri, 3 Oct" */
export function formatDay(iso: string): string {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "10:00 AM" */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? "AM" : "PM"}`;
}

/** "Fri, 3 Oct at 10:00 AM" */
export function formatDateTime(iso: string): string {
  return `${formatDay(iso)} at ${formatTime(iso)}`;
}

/** Local calendar-day key, "2026-10-03". Used to group slots by day. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** { weekday: "Fri", date: 3, month: "Oct" } for a day key or ISO string. */
export function dayParts(iso: string) {
  const d = new Date(iso);
  return { weekday: DAYS[d.getDay()], date: d.getDate(), month: MONTHS[d.getMonth()] };
}

/** 4500, "USD" -> "$45.00". Falls back to "USD 45.00" if the runtime can't format the currency. */
export function formatMoney(minor: number, currency: string): string {
  const major = minor / 100;
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).format(major);
  } catch {
    return `${currency} ${major.toFixed(2)}`;
  }
}

export function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}
