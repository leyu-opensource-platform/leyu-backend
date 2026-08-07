import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
export type AfroResponse = {
  acknowledge: string;
  response: {
    phone: string;
    code: string;
    verificationId: string;
    sentAt: string;
  };
};
@Injectable()
export class SmsService {
  constructor() {}
  async sendVerificationCode(
    phone: string,
    otp: string,
  ): Promise<{ error?: string; afro: AfroResponse | null }> {
    const base_url = process.env.AFRO_SMS_BASE_URL + '/send';
    const token = process.env.AFRO_TOKEN as string;
    const identifierId = process.env.AFRO_SMS_IDENTIFIER as string;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const sender = process.env.AFRO_SMS_SENDER as string; //process.env.AFRO_SMS_SENDER as string
    const message = `Your verification code is ${otp}`;
    console.log(message);
    const sendTry = `${base_url}?from=${identifierId}&sender=${sender}&to=${phone}&message=${message}`;
    try {
      const res: { data: AfroResponse } = await axios.get(sendTry, {
        headers,
      });
      Logger.log('[**] SMS SENT', res.data);
      return { error: '', afro: res.data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Logger.warn('Error In Sending SMS', errorMessage);
      return { error: errorMessage, afro: null };
    }
  }
}
