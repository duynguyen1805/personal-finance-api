import { EMessageTypeEnum } from './enums/message-types.enum';
import { Fetch } from './fetch';

export function sendMessageTelegram(
  type: string,
  chatId: number,
  text: string,
  urlMedia?: string
) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (type == EMessageTypeEnum.TEXT) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    // tslint:disable-next-line: variable-name
    const parse_mode = text.includes('<b>') ? 'html' : 'markdown';
    const body = JSON.stringify({ chat_id: chatId, text, parse_mode });
    return Fetch.post(url, { body });
  }
  if (type == EMessageTypeEnum.PHOTO) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    // tslint:disable-next-line: variable-name
    const parse_mode = text.includes('<b>') ? 'html' : 'markdown';
    const body = JSON.stringify({
      chat_id: chatId,
      photo: urlMedia, // URL of the image to send
      caption: text || '', // Optional caption
      parse_mode: text ? parse_mode : undefined // Only include parse_mode if caption is provided
    });
    return Fetch.post(url, { body });
  }
  // gif/video
  if (type == EMessageTypeEnum.VIDEO) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`;
    // tslint:disable-next-line: variable-name
    const parse_mode = text.includes('<b>') ? 'html' : 'markdown';
    const body = JSON.stringify({
      chat_id: chatId,
      video: urlMedia, // URL of the image to send
      caption: text || '', // Optional caption
      parse_mode: text ? parse_mode : undefined // Only include parse_mode if caption is provided
    });
    return Fetch.post(url, { body });
  }
}
