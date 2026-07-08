import { test, expect } from '@playwright/test';
import {
  ApiClient,
  createActiveCourse,
  jsonOf,
  loginAsAdmin,
  nextWeekdayAt,
  onboardMentor,
  pastWeekdayAt,
  registerAndLogin,
  unwrap,
} from './support/api';

test.describe('Course booking flow (free course, auto-confirm)', () => {
  async function setupFreeCourseWithSchedule(request: any) {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: mentorClient, user: mentor } = await onboardMentor(request, adminClient, {
      prefix: 'booking_mentor',
    });
    const course = await createActiveCourse(mentorClient, {
      price: 0,
      time: {
        monday: ['09:00-10:30', '15:30-17:00'],
        friday: ['14:00-15:30'],
      },
    });
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'booking_mentee' });
    return { adminClient, mentorClient, mentor, course, menteeClient };
  }

  test('mentee books a free course inside the mentor schedule -> booking auto-confirms', async ({ request }) => {
    const { course, menteeClient } = await setupFreeCourseWithSchedule(request);
    const meetingTime = nextWeekdayAt('monday', 9, 30, 2);

    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
      notesForMentor: 'Looking forward to it!',
    });
    expect(bookingRes.status()).toBe(201);
    const booking = unwrap<any>(await jsonOf(bookingRes));
    expect(booking.status).toBe('confirmed');
    expect(booking.courseId).toBe(course.id);
  });

  test('booking is rejected when the mentor has no slots on that weekday', async ({ request }) => {
    const { course, menteeClient } = await setupFreeCourseWithSchedule(request);
    const meetingTime = nextWeekdayAt('tuesday', 9, 30, 2); // Tuesday not configured

    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
    });
    expect(bookingRes.status()).toBe(400);
    const body = await jsonOf(bookingRes);
    expect(JSON.stringify(body)).toMatch(/không rảnh vào thứ/i);
  });

  test('booking is rejected when the time is outside of the configured slot on a valid day', async ({ request }) => {
    const { course, menteeClient } = await setupFreeCourseWithSchedule(request);
    const meetingTime = nextWeekdayAt('monday', 12, 0, 2); // Monday configured, but 12:00 is outside both slots

    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
    });
    expect(bookingRes.status()).toBe(400);
    const body = await jsonOf(bookingRes);
    expect(JSON.stringify(body)).toMatch(/không nằm trong khung giờ rảnh/i);
  });

  test('a second mentee cannot book the same course while an active booking exists', async ({ request }) => {
    const { course, menteeClient } = await setupFreeCourseWithSchedule(request);
    const { client: secondMenteeClient } = await registerAndLogin(request, { prefix: 'booking_mentee2' });

    const firstMeetingTime = nextWeekdayAt('friday', 14, 0, 2);
    const firstRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: firstMeetingTime.toISOString(),
    });
    expect(firstRes.status()).toBe(201);

    const secondMeetingTime = nextWeekdayAt('monday', 15, 30, 2);
    const secondRes = await secondMenteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: secondMeetingTime.toISOString(),
    });
    expect(secondRes.status()).toBe(400);
    const body = await jsonOf(secondRes);
    expect(JSON.stringify(body)).toMatch(/đã có học viên đăng ký/i);
  });

  test('check-conflict detects overlapping meeting times for the same mentee across courses', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: mentorClient } = await onboardMentor(request, adminClient, { prefix: 'booking_conflict_mentor' });
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'booking_conflict_mentee' });

    const courseA = await createActiveCourse(mentorClient, {
      price: 0,
      time: { monday: ['09:00-10:30'] },
      title: `Conflict Course A ${Date.now()}`,
    });
    const courseB = await createActiveCourse(mentorClient, {
      price: 0,
      time: { monday: ['09:00-10:30'] },
      title: `Conflict Course B ${Date.now()}`,
    });

    const meetingTime = nextWeekdayAt('monday', 9, 30, 2);
    const firstBookingRes = await menteeClient.post('course-bookings', {
      courseId: courseA.id,
      meetingTime: meetingTime.toISOString(),
    });
    expect(firstBookingRes.status()).toBe(201);

    // check-conflict cho slot trùng ở course khác phải báo hasConflict=true trước khi thực sự đặt
    const checkRes = await menteeClient.get('course-bookings/check-conflict', {
      params: { courseId: courseB.id, meetingTime: meetingTime.toISOString() },
    });
    expect(checkRes.status()).toBe(200);
    const check = unwrap<any>(await jsonOf(checkRes));
    expect(check.hasConflict).toBe(true);

    // Đặt thật cũng phải bị từ chối với cùng lý do
    const secondBookingRes = await menteeClient.post('course-bookings', {
      courseId: courseB.id,
      meetingTime: meetingTime.toISOString(),
    });
    expect(secondBookingRes.status()).toBe(400);
  });

  test('mentee can cancel their own upcoming booking, mentor can view and update it', async ({ request }) => {
    const { mentorClient, course, menteeClient } = await setupFreeCourseWithSchedule(request);
    const meetingTime = nextWeekdayAt('friday', 14, 0, 2);

    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
    });
    const booking = unwrap<any>(await jsonOf(bookingRes));

    // Mentor xem được booking thuộc course của mình
    const mentorViewRes = await mentorClient.get(`course-bookings/${booking.id}`);
    expect(mentorViewRes.status()).toBe(200);

    // Mentor cập nhật link Google Meet
    const mentorUpdateRes = await mentorClient.patch(`course-bookings/${booking.id}`, {
      googleMeetUrl: 'https://meet.google.com/e2e-test',
    });
    expect(mentorUpdateRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(mentorUpdateRes)).googleMeetUrl).toBe('https://meet.google.com/e2e-test');

    // Mentee tự hủy booking của mình
    const cancelRes = await menteeClient.patch(`course-bookings/${booking.id}/me`, {
      status: 'cancelled',
      cancellationReason: 'Change of plans',
    });
    expect(cancelRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(cancelRes)).status).toBe('cancelled');
  });

  test('mentee cannot view or cancel a booking that belongs to another mentee', async ({ request }) => {
    const { course, menteeClient } = await setupFreeCourseWithSchedule(request);
    const { client: strangerClient } = await registerAndLogin(request, { prefix: 'booking_stranger' });

    const meetingTime = nextWeekdayAt('friday', 14, 0, 2);
    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
    });
    const booking = unwrap<any>(await jsonOf(bookingRes));

    const strangerViewRes = await strangerClient.get(`course-bookings/${booking.id}`);
    expect(strangerViewRes.status()).toBe(403);

    const strangerCancelRes = await strangerClient.patch(`course-bookings/${booking.id}/me`, {
      status: 'cancelled',
    });
    expect(strangerCancelRes.status()).toBe(403);
  });

  test('a mentor cannot see bookings for courses they do not own', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { course, menteeClient } = await setupFreeCourseWithSchedule(request);
    const { client: otherMentorClient } = await onboardMentor(request, adminClient, { prefix: 'booking_other_mentor' });

    const meetingTime = nextWeekdayAt('friday', 14, 0, 2);
    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
    });
    const booking = unwrap<any>(await jsonOf(bookingRes));

    const res = await otherMentorClient.get(`course-bookings/${booking.id}`);
    expect(res.status()).toBe(403);
  });

  test('cancelling an upcoming booking releases the course for another mentee', async ({ request }) => {
    const { course, menteeClient } = await setupFreeCourseWithSchedule(request);
    const { client: secondMenteeClient } = await registerAndLogin(request, { prefix: 'booking_after_cancel' });
    const firstMeetingTime = nextWeekdayAt('friday', 14, 0, 2);

    const firstRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: firstMeetingTime.toISOString(),
    });
    const firstBooking = unwrap<any>(await jsonOf(firstRes));

    const cancelRes = await menteeClient.patch(`course-bookings/${firstBooking.id}/me`, {
      status: 'cancelled',
      cancellationReason: 'Cannot attend',
    });
    expect(cancelRes.status()).toBe(200);

    const secondMeetingTime = nextWeekdayAt('monday', 15, 30, 3);
    const secondRes = await secondMenteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: secondMeetingTime.toISOString(),
    });
    expect(secondRes.status()).toBe(201);
    expect(unwrap<any>(await jsonOf(secondRes)).status).toBe('confirmed');
  });

  test('mentee cannot spoof booking status or cancel a meeting after it has happened', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: mentorClient } = await onboardMentor(request, adminClient, {
      prefix: 'booking_past_mentor',
    });
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'booking_past_mentee' });
    const course = await createActiveCourse(mentorClient, {
      price: 0,
      time: { wednesday: ['15:00-16:00'] },
    });
    const meetingTime = pastWeekdayAt('wednesday', 15, 0, 2);

    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
    });
    expect(bookingRes.status()).toBe(201);
    const booking = unwrap<any>(await jsonOf(bookingRes));

    const completeByMenteeRes = await menteeClient.patch(`course-bookings/${booking.id}/me`, {
      status: 'completed',
    });
    expect(completeByMenteeRes.status()).toBe(400);

    const cancelPastRes = await menteeClient.patch(`course-bookings/${booking.id}/me`, {
      status: 'cancelled',
    });
    expect(cancelPastRes.status()).toBe(400);
  });

  test('mentee booking list ignores foreign menteeId filters', async ({ request }) => {
    const { course, menteeClient } = await setupFreeCourseWithSchedule(request);
    const { client: strangerClient, user: stranger } = await registerAndLogin(request, {
      prefix: 'booking_list_stranger',
    });
    const meetingTime = nextWeekdayAt('friday', 14, 0, 2);
    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
    });
    const booking = unwrap<any>(await jsonOf(bookingRes));

    const strangerListRes = await strangerClient.get('course-bookings', {
      params: { menteeId: booking.menteeId, limit: 100 },
    });
    expect(strangerListRes.status()).toBe(200);
    const body = await jsonOf(strangerListRes);
    const items = Array.isArray(body?.data) ? body.data : [];
    expect(items.every((item: any) => item.menteeId === stranger.id)).toBe(true);
    expect(items.some((item: any) => item.id === booking.id)).toBe(false);
  });
});
