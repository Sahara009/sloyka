// Показывает, кто написал боту — чтобы узнать TELEGRAM_CHAT_ID.
// 1) каждый получатель уведомлений пишет боту /start; 2) запуск: node --env-file=.env.local scripts/telegram-chats.mjs
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.log("Нет TELEGRAM_BOT_TOKEN в .env.local");
  process.exit(1);
}
const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const json = await res.json();
if (!json.ok) {
  console.log("Telegram ответил ошибкой:", json.description);
  process.exit(1);
}
const chats = new Map();
for (const u of json.result) {
  const c = (u.message ?? u.my_chat_member ?? u.channel_post)?.chat;
  if (c) chats.set(c.id, [c.first_name, c.last_name, c.username && `@${c.username}`, c.title].filter(Boolean).join(" "));
}
if (!chats.size) console.log("Пока никто не написал боту. Напишите ему /start и запустите ещё раз.");
for (const [id, name] of chats) console.log(`${id}\t${name}`);
if (chats.size) console.log(`\nВ .env.local: TELEGRAM_CHAT_ID=${[...chats.keys()].join(",")}`);
