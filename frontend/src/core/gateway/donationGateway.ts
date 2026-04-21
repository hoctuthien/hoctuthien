import { cache } from 'react';
import { apiService } from '../api/base';
import { formatCurrency, formatDate } from '@/shared/utils/format';

/**
 * Layer 3 - BFF Gateway
 * Responsible for data transformation, caching, and calling the API Service.
 */

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  formattedAmount?: string;
  createdAt: string;
  formattedDate?: string;
}

export const donationGateway = {
  /**
   * Get list of donations with transformed data
   * This function should be called from Server Components or API Routes
   */
  async getDonations(): Promise<Donation[]> {
    return cache(async () => {
      const rawDonations = await apiService.get<Donation[]>('/donations', {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      // Transform data before returning
      return rawDonations.map((donation) => ({
        ...donation,
        formattedAmount: formatCurrency(donation.amount),
        formattedDate: formatDate(donation.createdAt),
      }));
    })();
  },
};
