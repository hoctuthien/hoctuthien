import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { toVNDateString } from '../payment.utils';

/**
 * Parse transactionTime từ TN App API sang Date UTC.
 *
 * API thực tế trả về ISO-like "2026-05-20T17:21:00" (không có timezone) → giờ VN (UTC+7).
 * Test mock dùng "YYYY-MM-DD HH:mm:ss" → cần hỗ trợ cả hai format.
 */
function parseTxTime(txTime: string): Date {
  // Chuẩn hóa về "YYYY-MM-DDTHH:mm:ss" rồi gán UTC+7
  const normalized = txTime.replace(' ', 'T'); // "2026-05-20 17:21:00" → "2026-05-20T17:21:00"
  const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
  return new Date(new Date(normalized).getTime() - VN_OFFSET_MS);
}

export interface TNTransaction {
  id: string;
  refId: string;
  transactionTime: string; // VN time UTC+7, không có timezone info
  type: 'CREDIT' | 'DEBIT';
  transactionAmount: number;
  otherAccountDisplayName: string;
  otherAccountName: string;
  narrative: string;
  incognito: boolean;
}

export interface TNTransactionPayload {
  transactions: TNTransaction[];
  count: number;
  pageNumber: number;
  accountNumber: string;
  accountName: string;
  hasNextPage: boolean;
  totalCredit: number;
  totalDebit: number;
}

/** Wrapper ngoài cùng mà TN App API thực tế trả về */
export interface TNApiWrapper {
  status: number;
  code: string;
  error: string;
  codes: unknown;
  data: TNTransactionPayload;
}

export interface TNTransactionResponse {
  status: number;
  data: TNTransactionPayload;
}

export interface FindTransactionResult {
  found: boolean;
  transaction: TNTransaction | null;
  rawResponse?: string;
  error?: string;
}

@Injectable()
export class TnAppService {
  private readonly logger = new Logger(TnAppService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Dùng bởi Cron Job ─────────────────────────────────────────────────────
  /**
   * Fetch tất cả giao dịch CREDIT trong khoảng [fromDate, toDate] từ TN App.
   * Cron job gọi 1 lần duy nhất rồi match locally trong RAM — tránh N+1 API call.
   *
   * @returns Mảng TNTransaction CREDIT. Trả mảng rỗng nếu lỗi hoặc không có tx.
   */
  async fetchLatestBatch(
    fromDate: Date,
    toDate: Date,
  ): Promise<TNTransaction[]> {
    const baseUrl = this.configService.get<string>('tnApp.baseUrl');
    const accountNo = this.configService.get<string>('tnApp.accountNo');

    const from = toVNDateString(fromDate);
    const to = toVNDateString(toDate);

    const url =
      `${baseUrl}/bank-account-transaction/${accountNo}/transactionsV2` +
      `?fromDate=${from}&toDate=${to}&keyword=&pageNumber=1&pageSize=50`;

    try {
      const response: AxiosResponse<TNApiWrapper> =
        await firstValueFrom(
          this.httpService.get<TNApiWrapper>(url, {
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      if (response.status !== 200) {
        this.logger.warn(
          `[TnApp] fetchLatestBatch HTTP ${response.status}`,
        );
        return [];
      }

      // API trả về: { status, data: { transactions: [...] } }
      const transactions = response.data?.data?.transactions;
      if (!Array.isArray(transactions)) {
        this.logger.warn(
          `[TnApp] fetchLatestBatch: data.transactions không phải mảng. ` +
          `Payload nhận được: ${JSON.stringify(response.data).slice(0, 300)}`,
        );
        return [];
      }
      return transactions.filter((tx) => tx.type === 'CREDIT');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[TnApp] fetchLatestBatch lỗi: ${message}`);
      return [];
    }
  }

  // ─── Dùng bởi API thủ công ─────────────────────────────────────────────────
  /**
   * Tìm 1 giao dịch CREDIT cụ thể khớp shortCode + amount.
   * Dùng khi user bấm nút "Tôi đã chuyển khoản".
   */
  async findTransactionByCode(
    shortCode: string,
    fromDate: Date,
    expectedAmount: number,
  ): Promise<FindTransactionResult> {
    const baseUrl = this.configService.get<string>('tnApp.baseUrl');
    const accountNo = this.configService.get<string>('tnApp.accountNo');

    const from = toVNDateString(fromDate);
    const to = toVNDateString(new Date());

    const url =
      `${baseUrl}/bank-account-transaction/${accountNo}/transactionsV2` +
      `?fromDate=${from}&toDate=${to}&keyword=&pageNumber=1&pageSize=50`;

    let rawResponse = '';

    try {
      const response: AxiosResponse<TNApiWrapper> =
        await firstValueFrom(
          this.httpService.get<TNApiWrapper>(url, {
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      // API trả về: { status, data: { transactions: [...] } }
      const payload = response.data?.data;
      rawResponse = JSON.stringify(payload).slice(0, 2000);

      if (!payload?.transactions || !Array.isArray(payload.transactions)) {
        this.logger.warn(`[TnApp] Không có trường transactions trong response`);
        return { found: false, transaction: null, rawResponse };
      }

      const match = payload.transactions.find(
        (tx) =>
          tx.type === 'CREDIT' &&
          tx.narrative.toUpperCase().includes(shortCode.toUpperCase()) &&
          tx.transactionAmount >= expectedAmount,
      );

      if (match && parseTxTime(match.transactionTime) >= fromDate) {
        this.logger.log(
          `[TnApp] Tìm thấy giao dịch khớp: ${match.id} — ${match.narrative}`,
        );
        return { found: true, transaction: match, rawResponse };
      }

      return { found: false, transaction: null, rawResponse };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[TnApp] findTransactionByCode lỗi: ${message}`);
      return { found: false, transaction: null, error: message };
    }
  }
}
