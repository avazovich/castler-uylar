/**
 * Posts to the "Castler | Leads" group via @castler_salesbot (same bot and
 * group as the internal app and castler.uz). Returns false instead of
 * throwing, so the caller decides what a lost message means — for a sales
 * lead the visitor is told to retry or call, rather than silently dropped.
 */
export async function notifyTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("notifyTelegram: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    if (!res.ok) {
      console.error("notifyTelegram: Telegram API returned", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("notifyTelegram: failed to send", err);
    return false;
  }
}
