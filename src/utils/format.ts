const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(value: number): string {
  return COP.format(value);
}

export function formatDistance(meters: number | null): string | null {
  if (meters == null) return null;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function shortAddress(displayName: string, maxParts = 3): string {
  const parts = displayName.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.slice(0, maxParts).join(", ");
}
