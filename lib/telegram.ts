/**
 * Posts to the founders' group («Castler Management», the old "Castler | Leads")
 * via @castler_salesbot (same bot and group as the internal app and
 * castler.uz). Returns false instead of throwing, so the caller decides what a
 * lost message means — for a sales lead the visitor is told to retry or call,
 * rather than silently dropped.
 */

// The group got a new id when topics were turned on (2026-11-19). The old id in
// TELEGRAM_CHAT_ID is mapped here, and any later move Telegram reports is followed once.
const MOVED: Record<string, string> = { "-5499045694": "-1003820669157" };

type Reply = { ok?: boolean; description?: string; parameters?: { migrate_to_chat_id?: number } };

export async function notifyTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const raw = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !raw) {
    console.warn("notifyTelegram: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set");
    return false;
  }

  const send = async (chatId: string): Promise<Reply> => {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    return (await res.json().catch(() => ({}))) as Reply;
  };

  try {
    let body = await send(MOVED[raw] ?? raw);
    if (!body.ok && body.parameters?.migrate_to_chat_id) body = await send(String(body.parameters.migrate_to_chat_id));
    if (!body.ok) {
      console.error("notifyTelegram: Telegram rejected the message:", body.description);
      return false;
    }
    return true;
  } catch (err) {
    console.error("notifyTelegram: failed to send", err);
    return false;
  }
}
