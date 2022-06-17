import format from "date-fns/format";

export const convertDollarsToCents = price => (price * 100).toFixed(0);

export const convertCentsToDollar = price => (price / 100).toFixed(2);

export const formatProductDate = date => format(new Date(date), "MMM dd, yyyy");

export const formatOrderDate = date =>
  format(new Date(date), "h:mm, MMM dd, yyyy");
