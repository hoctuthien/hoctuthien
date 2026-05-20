import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { toVNDateString } from '../payment.utils';

// ─── Interfaces ──────────────────────────────────────────────────────────────

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

export interface TNTransactionResponse {
  status: number;
  data: TNTransactionPayload;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class TnAppService {
  private readonly logger = new Logger(TnAppService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Lấy toàn bộ giao dịch CREDIT trong khoảng [fromDate, toDate] từ TN App.
   *
   * Loop qua tất cả các trang (hasNextPage) để đảm bảo không bỏ sót giao dịch.
   * Chỉ giữ lại giao dịch type === 'CREDIT' vì chúng ta chỉ quan tâm đến tiền vào.
   *
   * @returns Mảng TNTransaction CREDIT đã gom từ tất cả các trang. Trả về [] nếu lỗi.
   */
  async fetchLatestBatch(fromDate: Date, toDate: Date): Promise<TNTransaction[]> {
    const baseUrl = this.configService.get<string>('tnApp.baseUrl');
    const accountNo = this.configService.get<string>('tnApp.accountNo');

    const from = toVNDateString(fromDate);
    const to = toVNDateString(toDate);

    const allTransactions: TNTransaction[] = [];
    let pageNumber = 1;

    do {
      const url =
        `${baseUrl}/bank-account-transaction/${accountNo}/transactionsV2` +
        `?fromDate=${from}&toDate=${to}&keyword=&pageNumber=${pageNumber}&pageSize=50`;

      try {
        // TN App trả về dạng wrapped: { status: number, data: TNTransactionPayload }
        // Generic type phải là TNTransactionResponse, sau đó unwrap .data.data
        const response: AxiosResponse<TNTransactionResponse> = await firstValueFrom(
          this.httpService.get<TNTransactionResponse>(url, {
            headers: { 'Content-Type': 'application/json' },
          }),
        );

        if (response.status !== 200) {
          this.logger.warn(
            `[TnApp] HTTP ${response.status} tại page ${pageNumber}. Dừng fetch.`,
          );
          break;
        }

        // response.data       → TNTransactionResponse  { status, data }
        // response.data.data  → TNTransactionPayload   { transactions[], hasNextPage, ... }
        const payload = response.data?.data;

        // Guard: nếu API trả về shape không mong đợi thì dừng, không crash cron
        if (!payload || !Array.isArray(payload.transactions)) {
          this.logger.warn(
            `[TnApp] Response page ${pageNumber} có shape không hợp lệ. Dừng fetch.`,
          );
          break;
        }

        const creditOnly = payload.transactions.filter((tx) => tx.type === 'CREDIT');
        allTransactions.push(...creditOnly);

        this.logger.debug(
          `[TnApp] Page ${pageNumber}: ${payload.transactions.length} tx, ` +
            `${creditOnly.length} CREDIT, hasNextPage=${payload.hasNextPage}`,
        );

        if (!payload.hasNextPage) break;
        pageNumber++;
      } catch (error) {
        // Bắt lỗi network hoặc timeout ở từng trang riêng lẻ.
        // Không re-throw để tránh crash cron job — cron sẽ retry ở lần chạy tiếp theo.
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `[TnApp] Lỗi khi fetch page ${pageNumber}: ${message}`,
        );
        break;
      }
    } while (true);

    this.logger.log(
      `[TnApp] Fetch hoàn tất: ${allTransactions.length} CREDIT tx từ ${from} → ${to}`,
    );

    return allTransactions;
  }
}
