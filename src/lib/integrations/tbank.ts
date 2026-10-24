import { createHash } from "node:crypto";

/**
 * Т-Банк интернет-эквайринг (карты + СБП), метод Init.
 * Ключи TBANK_TERMINAL_KEY / TBANK_PASSWORD выдаются после подключения эквайринга.
 * TODO: сверить адрес API и поля с актуальной документацией Т-Банка перед запуском.
 */
const API_URL = "https://securepay.tinkoff.ru/v2";

type InitParams = {
  orderId: string;
  amountRub: number;
  description: string;
  email: string;
  phone?: string;
  items: { name: string; price: number; qty: number }[];
  successUrl: string;
  failUrl: string;
};

/** Подпись запроса: значения корневых полей + Password, отсортированные по ключу, SHA-256 */
function makeToken(params: Record<string, string | number>, password: string) {
  const data: Record<string, string | number> = { ...params, Password: password };
  const joined = Object.keys(data)
    .sort()
    .map((k) => String(data[k]))
    .join("");
  return createHash("sha256").update(joined).digest("hex");
}

export function tbankConfigured() {
  return Boolean(process.env.TBANK_TERMINAL_KEY && process.env.TBANK_PASSWORD);
}

export async function tbankInit(p: InitParams): Promise<{ paymentUrl: string; paymentId: string }> {
  const terminalKey = process.env.TBANK_TERMINAL_KEY!;
  const password = process.env.TBANK_PASSWORD!;

  const root = {
    TerminalKey: terminalKey,
    Amount: Math.round(p.amountRub * 100), // в копейках
    OrderId: p.orderId,
    Description: p.description.slice(0, 140),
    SuccessURL: p.successUrl,
    FailURL: p.failUrl,
  };

  const body = {
    ...root,
    Token: makeToken(root, password),
    DATA: { Email: p.email, Phone: p.phone ?? "" },
    // Чек: для самозанятого чек формируется в «Мой налог», для ИП — через онлайн-кассу.
    // TODO: заполнить Receipt, если заказчик будет ИП с онлайн-кассой.
  };

  const res = await fetch(`${API_URL}/Init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.Success) throw new Error(json.Message ?? "Ошибка платёжной системы");
  return { paymentUrl: json.PaymentURL, paymentId: String(json.PaymentId) };
}
