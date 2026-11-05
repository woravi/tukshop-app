const thb = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" });

export function formatTHB(value) {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "Price unavailable";
  return thb.format(Number(value));
}
