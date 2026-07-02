import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BadgeService } from '../services/badge.service';
import {
  BOOKING_COMPLETED_EVENT,
  BookingCompletedPayload,
} from '../../course-booking/events/course-booking.events';

@Injectable()
export class BadgeListener {
  private readonly logger = new Logger(BadgeListener.name);

  constructor(private readonly badgeService: BadgeService) {}

  @OnEvent(BOOKING_COMPLETED_EVENT, { async: true })
  async handleBookingCompleted(payload: BookingCompletedPayload) {
    try {
      await this.badgeService.checkAndAwardBadges(payload.menteeId, 'mentee');
      if (payload.mentorId) {
        await this.badgeService.checkAndAwardBadges(payload.mentorId, 'mentor');
      }
    } catch (err: any) {
      this.logger.error(`Badge check failed: ${err?.message}`);
    }
  }
}
