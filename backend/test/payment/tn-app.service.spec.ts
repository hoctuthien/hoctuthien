/**
 * Unit Tests — TnAppService
 *
 * Tổng số test case: 18
 *
 * Nhóm test:
 *  A. fetchLatestBatch — Filter & Error handling (TC-301 → TC-307)
 *  B. findTransactionByCode — Match logic (TC-308 → TC-314)
 *  C. findTransactionByCode — Error & Edge cases (TC-315 → TC-318)
 */

import { TnAppService, TNTransaction } from '../../src/modules/payment/services/tn-app.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.thiennguyen.app';
const ACCOUNT_NO = '0961234567';

function makeTx(overrides: Partial<TNTransaction> = {}): TNTransaction {
  return {
    id: 'tx-001',
    refId: 'ref-001',
    transactionTime: '2026-05-20 09:05:00',
    type: 'CREDIT',
    transactionAmount: 10000,
    otherAccountDisplayName: 'NGUYEN VAN A',
    otherAccountName: 'NGUYEN VAN A',
    narrative: 'KICHHOAT user-001ABC',
    incognito: false,
    ...overrides,
  };
}

function makeAxiosResponse(transactions: TNTransaction[], status = 200): AxiosResponse<any> {
  return {
    status,
    data: {
      transactions,
      count: transactions.length,
      pageNumber: 1,
      accountNumber: ACCOUNT_NO,
      accountName: 'Test Account',
      hasNextPage: false,
      totalCredit: 10000,
      totalDebit: 0,
    },
    headers: {},
    config: { headers: {} } as any,
    statusText: 'OK',
  };
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('TnAppService', () => {
  let service: TnAppService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    httpService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'tnApp.baseUrl') return BASE_URL;
        if (key === 'tnApp.accountNo') return ACCOUNT_NO;
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    service = new TnAppService(httpService, configService);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // A. fetchLatestBatch
  // ═══════════════════════════════════════════════════════════════════════════

  describe('A. fetchLatestBatch', () => {
    const fromDate = new Date('2026-05-20T00:00:00Z');
    const toDate = new Date('2026-05-20T09:00:00Z');

    /**
     * TC-301: Chỉ trả về giao dịch CREDIT, lọc bỏ DEBIT
     */
    it('TC-301: nên chỉ trả về giao dịch CREDIT, lọc bỏ DEBIT', async () => {
      const credit = makeTx({ id: 'credit-1', type: 'CREDIT' });
      const debit = makeTx({ id: 'debit-1', type: 'DEBIT' });
      httpService.get.mockReturnValue(of(makeAxiosResponse([credit, debit])));

      const result = await service.fetchLatestBatch(fromDate, toDate);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('CREDIT');
    });

    /**
     * TC-302: TN App trả HTTP 4xx → return mảng rỗng (không throw)
     */
    it('TC-302: nên return [] khi TN App trả HTTP status != 200', async () => {
      httpService.get.mockReturnValue(of(makeAxiosResponse([], 500)));

      const result = await service.fetchLatestBatch(fromDate, toDate);

      expect(result).toEqual([]);
    });

    /**
     * TC-303: Network error (Observable throw) → return mảng rỗng
     */
    it('TC-303: nên return [] khi có network error (không crash cron)', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('ECONNREFUSED')),
      );

      const result = await service.fetchLatestBatch(fromDate, toDate);

      expect(result).toEqual([]);
    });

    /**
     * TC-304: Không có giao dịch CREDIT → return mảng rỗng
     */
    it('TC-304: nên return [] khi không có giao dịch CREDIT nào', async () => {
      httpService.get.mockReturnValue(of(makeAxiosResponse([])));

      const result = await service.fetchLatestBatch(fromDate, toDate);

      expect(result).toEqual([]);
    });

    /**
     * TC-305: URL được build đúng với accountNo và date range
     */
    it('TC-305: nên gọi đúng URL với accountNo và date range', async () => {
      httpService.get.mockReturnValue(of(makeAxiosResponse([])));

      await service.fetchLatestBatch(fromDate, toDate);

      const calledUrl: string = httpService.get.mock.calls[0][0];
      expect(calledUrl).toContain(ACCOUNT_NO);
      expect(calledUrl).toContain('transactionsV2');
      expect(calledUrl).toContain('fromDate=');
      expect(calledUrl).toContain('toDate=');
    });

    /**
     * TC-306: Nhiều giao dịch CREDIT → trả về tất cả
     */
    it('TC-306: nên trả về tất cả giao dịch CREDIT khi có nhiều', async () => {
      const credits = [
        makeTx({ id: 'c-1', type: 'CREDIT' }),
        makeTx({ id: 'c-2', type: 'CREDIT' }),
        makeTx({ id: 'c-3', type: 'CREDIT' }),
      ];
      httpService.get.mockReturnValue(of(makeAxiosResponse(credits)));

      const result = await service.fetchLatestBatch(fromDate, toDate);

      expect(result).toHaveLength(3);
    });

    /**
     * TC-307: Timeout error → return mảng rỗng (không crash cron)
     */
    it('TC-307: nên return [] khi request timeout', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('Request timeout')),
      );

      const result = await service.fetchLatestBatch(fromDate, toDate);

      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // B. findTransactionByCode — Match Logic
  // ═══════════════════════════════════════════════════════════════════════════

  describe('B. findTransactionByCode — Match Logic', () => {
    const shortCode = 'KICHHOAT user-001ABC';
    const fromDate = new Date('2026-05-20T00:00:00.000Z'); // UTC
    const amount = 10000;

    /**
     * TC-308: Tìm thấy giao dịch khớp narrative + amount + type CREDIT → found: true
     */
    it('TC-308: nên trả về found=true khi tìm thấy giao dịch CREDIT khớp', async () => {
      const tx = makeTx({
        narrative: 'KICHHOAT USER-001ABC chuyển khoản', // uppercase
        transactionAmount: 10000,
        transactionTime: '2026-05-20 09:05:00', // UTC+7 = 2026-05-20T02:05:00Z
        type: 'CREDIT',
      });
      httpService.get.mockReturnValue(of(makeAxiosResponse([tx])));

      const result = await service.findTransactionByCode(shortCode, fromDate, amount);

      expect(result.found).toBe(true);
      expect(result.transaction).toBeDefined();
    });

    /**
     * TC-309: Giao dịch DEBIT khớp narrative → không match (phải là CREDIT)
     */
    it('TC-309: không được match giao dịch DEBIT dù narrative khớp', async () => {
      const tx = makeTx({
        type: 'DEBIT', // DEBIT → không phải tiền vào
        narrative: 'KICHHOAT USER-001ABC',
        transactionAmount: 10000,
      });
      httpService.get.mockReturnValue(of(makeAxiosResponse([tx])));

      const result = await service.findTransactionByCode(shortCode, fromDate, amount);

      expect(result.found).toBe(false);
    });

    /**
     * TC-310: Amount nhỏ hơn expectedAmount → không match
     */
    it('TC-310: không được match khi transactionAmount < expectedAmount', async () => {
      const tx = makeTx({
        narrative: 'KICHHOAT USER-001ABC',
        transactionAmount: 9000, // thiếu
        type: 'CREDIT',
      });
      httpService.get.mockReturnValue(of(makeAxiosResponse([tx])));

      const result = await service.findTransactionByCode(shortCode, fromDate, amount);

      expect(result.found).toBe(false);
    });

    /**
     * TC-311: Narrative không chứa shortCode → không match
     */
    it('TC-311: không được match khi narrative không chứa shortCode', async () => {
      const tx = makeTx({
        narrative: 'CHUYEN KHOAN KHAC 99999',
        transactionAmount: 10000,
        type: 'CREDIT',
      });
      httpService.get.mockReturnValue(of(makeAxiosResponse([tx])));

      const result = await service.findTransactionByCode(shortCode, fromDate, amount);

      expect(result.found).toBe(false);
    });

    /**
     * TC-312: Giao dịch trước fromDate → không match
     */
    it('TC-312: không được match giao dịch có transactionTime < fromDate', async () => {
      // fromDate = 2026-05-20T00:00:00Z (UTC)
      // transactionTime = 2026-05-19 10:00:00 UTC+7 = 2026-05-19T03:00:00Z → trước fromDate
      const tx = makeTx({
        narrative: 'KICHHOAT USER-001ABC',
        transactionAmount: 10000,
        transactionTime: '2026-05-19 10:00:00',
        type: 'CREDIT',
      });
      httpService.get.mockReturnValue(of(makeAxiosResponse([tx])));

      const result = await service.findTransactionByCode(shortCode, fromDate, amount);

      expect(result.found).toBe(false);
    });

    /**
     * TC-313: Nhiều giao dịch, chỉ 1 khớp → trả về đúng giao dịch đó
     */
    it('TC-313: nên trả về đúng giao dịch khớp khi có nhiều giao dịch', async () => {
      const matching = makeTx({ id: 'match-tx', narrative: 'KICHHOAT USER-001ABC' });
      const notMatching = makeTx({ id: 'other-tx', narrative: 'THANH TOAN KHAC' });
      httpService.get.mockReturnValue(
        of(makeAxiosResponse([notMatching, matching])),
      );

      const result = await service.findTransactionByCode(shortCode, fromDate, amount);

      expect(result.found).toBe(true);
      expect(result.transaction?.id).toBe('match-tx');
    });

    /**
     * TC-314: Match case-insensitive — shortCode lowercase, narrative uppercase → vẫn match
     */
    it('TC-314: nên match case-insensitive giữa shortCode và narrative', async () => {
      const lowercaseCode = 'kichhoat user-001abc';
      const tx = makeTx({
        narrative: 'KICHHOAT USER-001ABC',
        type: 'CREDIT',
        transactionAmount: 10000,
      });
      httpService.get.mockReturnValue(of(makeAxiosResponse([tx])));

      const result = await service.findTransactionByCode(
        lowercaseCode,
        fromDate,
        amount,
      );

      expect(result.found).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // C. findTransactionByCode — Error & Edge Cases
  // ═══════════════════════════════════════════════════════════════════════════

  describe('C. findTransactionByCode — Error & Edge Cases', () => {
    const shortCode = 'KICHHOAT user-001ABC';
    const fromDate = new Date('2026-05-20T00:00:00.000Z');
    const amount = 10000;

    /**
     * TC-315: Network error → found: false + error field được set
     */
    it('TC-315: nên trả về found=false và error field khi có network error', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('Connection refused')),
      );

      const result = await service.findTransactionByCode(shortCode, fromDate, amount);

      expect(result.found).toBe(false);
      expect(result.transaction).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Connection refused');
    });

    /**
     * TC-316: HTTP 500 → found: false + error field
     */
    it('TC-316: nên trả về found=false và error khi HTTP status != 200', async () => {
      httpService.get.mockReturnValue(of(makeAxiosResponse([], 500)));

      const result = await service.findTransactionByCode(shortCode, fromDate, amount);

      expect(result.found).toBe(false);
      expect(result.error).toBeDefined();
    });

    /**
     * TC-317: rawResponse được set khi API trả về 200 (để audit)
     */
    it('TC-317: nên set rawResponse khi API trả về 200 (dù không match)', async () => {
      httpService.get.mockReturnValue(of(makeAxiosResponse([])));

      const result = await service.findTransactionByCode(shortCode, fromDate, amount);

      expect(result.rawResponse).toBeDefined();
    });

    /**
     * TC-318: rawResponse được cắt tối đa 2000 ký tự
     */
    it('TC-318: rawResponse không được vượt quá 2000 ký tự', async () => {
      // Tạo response với nhiều transaction để raw JSON dài
      const manyTx = Array.from({ length: 50 }, (_, i) =>
        makeTx({ id: `tx-${i}`, narrative: `narrative-${i}-`.repeat(50) }),
      );
      httpService.get.mockReturnValue(of(makeAxiosResponse(manyTx)));

      const result = await service.findTransactionByCode(shortCode, fromDate, amount);

      if (result.rawResponse) {
        expect(result.rawResponse.length).toBeLessThanOrEqual(2000);
      }
    });
  });
});
