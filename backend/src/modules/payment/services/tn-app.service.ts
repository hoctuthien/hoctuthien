import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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

export interface FindTransactionResult {
  found: boolean;
  transaction: TNTransaction | null;
  rawResponse?: string;
  error?: string;
}

// TN App trả timestamp theo giờ VN (UTC+7) không có timezone info → cần xử lý thủ công
function toVNDateString(date: Date): string {
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vnDate.toISOString().split('T')[0];
}

function parseVNTime(vnTimeStr: string): Date {
  return new Date(vnTimeStr + '+07:00');
}

@Injectable()
export class TnAppService {
  private readonly logger = new Logger(TnAppService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  // Tìm giao dịch CREDIT có nội dung chứa shortCode và đủ số tiền, xảy ra sau fromDate
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

    let rawResponse: string | undefined;

    try {
      const response: AxiosResponse<TNTransactionPayload> = await firstValueFrom(
        this.httpService.get<TNTransactionPayload>(url, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      if (response.status !== 200) {
        this.logger.warn(`[TnApp] HTTP ${response.status} cho tài khoản ${accountNo}`);
        return { found: false, transaction: null, error: `HTTP ${response.status}` };
      }

      const data = response.data;
      rawResponse = JSON.stringify(data).slice(0, 2000);

      const match = data.transactions.find(
        (tx) =>
          tx.type === 'CREDIT' &&
          tx.narrative.toUpperCase().includes(shortCode.toUpperCase()) &&
          tx.transactionAmount >= expectedAmount,
      );

      if (match && parseVNTime(match.transactionTime) >= fromDate) {
        this.logger.log(`[TnApp] Tìm thấy giao dịch khớp: ${match.id} — ${match.narrative}`);
        return { found: true, transaction: match, rawResponse };
      }

      return { found: false, transaction: null, rawResponse };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[TnApp] Lỗi khi query giao dịch: ${message}`);
      return { found: false, transaction: null, rawResponse, error: message };
    }
  }
}
