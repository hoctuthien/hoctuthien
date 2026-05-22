import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { courseBookingSchema } from '../src/modules/course-booking/schema/course-booking.schema';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
  });

  await dataSource.initialize();
  
  const bookingId = 'd9bb7506-7c51-419e-96bd-e6d635bcd1c1';
  console.log(`Fetching booking ${bookingId}...`);
  const rows = await dataSource.query(`SELECT * FROM course_bookings WHERE id = $1`, [bookingId]);
  
  if (rows.length === 0) {
    console.log('Booking not found in DB!');
  } else {
    const item = rows[0];
    console.log('DB Record:', JSON.stringify(item, null, 2));
    console.log('DB Record types:');
    for (const key of Object.keys(item)) {
      console.log(`  - ${key}: ${typeof item[key]} (${Object.prototype.toString.call(item[key])})`);
    }
    
    try {
      console.log('Attempting to parse with courseBookingSchema...');
      // Convert db column names from snake_case to camelCase since DB returned rows might be snake_case!
      const mappedItem = {
        id: item.id,
        courseId: item.course_id,
        menteeId: item.mentee_id,
        paymentId: item.payment_id,
        meetingTime: item.meeting_time,
        googleMeetUrl: item.google_meet_url,
        calendarEventId: item.calendar_event_id,
        notesForMentor: item.notes_for_mentor,
        cancellationReason: item.cancellation_reason,
        metadata: item.metadata,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        deletedAt: item.deleted_at,
      };
      console.log('Mapped camelCase Record:', JSON.stringify(mappedItem, null, 2));
      const result = courseBookingSchema.parse(mappedItem);
      console.log('✅ Parse successful:', result);
    } catch (e: any) {
      console.error('❌ Parse failed!');
      if (e.errors) {
        console.error('Zod Errors:', JSON.stringify(e.errors, null, 2));
      } else {
        console.error(e);
      }
    }
  }
  
  await dataSource.destroy();
}

run().catch(console.error);
