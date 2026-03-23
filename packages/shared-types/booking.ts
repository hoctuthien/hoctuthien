/**
 * Shared Type: Booking
 * FE và BE cùng import để đảm bảo tính nhất quán của dữ liệu booking.
 */
export interface IBooking {
  id: string;
  mentorId: string;
  menteeId: string;
  startTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  donationAmount?: number;
}
