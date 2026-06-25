export const BOOKING_COMPLETED_EVENT = 'booking.completed';

export interface BookingCompletedPayload {
  bookingId: string;
  menteeId: string;
  mentorId?: string;
  courseId: string;
}
