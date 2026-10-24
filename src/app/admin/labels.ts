export const statusLabels: Record<string, string> = {
  NEW: "Новый",
  PAID: "Оплачен",
  IN_PRODUCTION: "В печати",
  SHIPPED: "Отправлен",
  DONE: "Получен",
  CANCELLED: "Отменён",
};

export const deliveryLabels: Record<string, string> = {
  "cdek-pvz": "СДЭК, пункт выдачи",
  "cdek-courier": "СДЭК, курьер",
  "ozon-pvz": "Ozon, пункт выдачи",
  "wb-pvz": "Wildberries, пункт выдачи",
};

export const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
