import { Message } from '@/types/message';

/**
 * Convert message.timestamp fields to Date instances
 */
export function convertMessageTimestamps(messages: Message[]): Message[] {
  if (!Array.isArray(messages)) return [];
  return messages.map((msg) => ({
    ...msg,
    // Some tests may already provide Date; guard to avoid double conversion
    timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp as any),
  }));
}

/**
 * Deduplicate messages by id, keeping the first occurrence in order
 */
export function dedupeMessagesById(messages: Message[]): Message[] {
  if (!Array.isArray(messages)) return [];
  const seen = new Set<string>();
  const result: Message[] = [];
  for (const m of messages) {
    if (m && typeof m.id === 'string' && !seen.has(m.id)) {
      seen.add(m.id);
      result.push(m);
    }
  }
  return result;
}
