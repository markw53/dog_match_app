export const formatPhoneNumber = (num: string): string => {
  const cleaned = ("" + num).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : num;
};

export const formatCurrency = (amount: number, currency: string = "USD"): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);