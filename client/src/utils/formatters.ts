// Formato para números de precio
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

// Formato para porcentajes
export const formatPercent = (percent: number) => {
  return `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`;
};
