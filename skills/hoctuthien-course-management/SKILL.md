---
name: hoctuthien-course-management
description: >-
  Guide and tools to manage courses, database seeding, GraphQL integrations, and booking logic in the Học Tự Thiện web application.
---

# Học Tự Thiện: Course Management & Booking Workflow Skill

## Overview
This skill provides complete architectural context, database seeding instructions, gateway patterns, and integration workflows for managing courses and bookings within the **Học Tự Thiện** platform.

The system is split into:
1. **Backend (NestJS):** Uses TypeORM, PostgreSQL, REST APIs, and GraphQL resolvers (`src/modules/course/resolvers/course.resolver.ts`).
2. **Frontend (Next.js 16+):** Uses `graphql-request`, `next-auth`, and tailwindcss, communicating with the backend via GraphQL queries and REST HTTP Clients.

---

## Architecture & Project Patterns

### 1. Database Seeding & Admin Approval Bypass
To make courses visible on the public page (`/courses`), they **must** have:
* `status: 'ACTIVE'`
* `approvedBy: <VALID_USER_ID>` (Cannot be `null` due to backend query constraints).

A custom seeding command is registered in `backend/package.json`:
```bash
# Execute in backend directory
npm run seed:mentor-courses
```
This runs `scripts/seed-custom-mentor-courses.ts` which automatically:
1. Creates/Updates a mentor user with ID `9011ac57-83e9-4685-9436-04eafab08d64`.
2. Creates/Updates a pre-approved active `MentorProfileEntity`.
3. Seeds 10 beautifully crafted real-world coding courses.
4. Auto-assigns `approvedBy: '9011ac57-83e9-4685-9436-04eafab08d64'` to instantly bypass query filters.
5. Auto-links each course to a relevant category.

### 2. Frontend Gateway Concerns Separation
Concerns are separated cleanly inside `frontend/src/core/gateway/` to keep code clean and maintainable:
* **[courseGateway.ts](file:///d:/code/http/hoctuthien/frontend/src/core/gateway/courseGateway.ts):** Dedicated entirely to course listings, creation, updates, and detail retrieval using GraphQL queries (`GetPublicCourses`, `GetCourse`) with REST client fallbacks.
* **[courseBookingGateway.ts](file:///d:/code/http/hoctuthien/frontend/src/core/gateway/courseBookingGateway.ts):** Dedicated to course registrations and bookings (`bookCourse` via `POST /v1/course-bookings`).

All gateways are exported via [index.ts](file:///d:/code/http/hoctuthien/frontend/src/core/gateway/index.ts).

---

## Practical Workflows

### 🟢 How to Seed & Reset Course Data
If you need to re-populate the database with the 10 premium courses for mentor `9011ac57-83e9-4685-9436-04eafab08d64`:
1. Navigate to `d:\code\http\hoctuthien\backend`.
2. Run:
   ```bash
   npm run seed:mentor-courses
   ```
3. All courses will be immediately updated to `ACTIVE` and approved.

### 🔵 How to Fetch Courses (GraphQL Integration)
The frontend retrieves courses via a GraphQL query on the `'courses'` query resolver.
**Query Schema:**
```graphql
query GetPublicCourses {
  courses {
    id
    mentorId
    approvedBy
    title
    description
    thumbnailUrl
    price
    durationMinutes
    status
    categories {
      id
      name
      slug
    }
  }
}
```

### 🟠 Course Booking Flow
To book a course:
1. The user visits `/courses/detail/[id]`.
2. If logged in as a Mentee, clicking **"Đăng ký học ngay"** opens the interactive Booking Modal.
3. The user selects a date (tomorrow onwards), a timeslot (e.g. `09:00`, `14:00`), writes optional notes, and clicks **"Xác nhận đăng ký"**.
4. The frontend invokes:
   ```typescript
   await courseBookingGateway.bookCourse({ courseId, meetingTime, notesForMentor });
   ```
5. The backend validates mentor slots (`metadata.time`) and active booking conflict rules, then saves with status `confirmed` (simplified payment auto-approval).

---

## Common Mistakes & Troubleshooting
* **Module not found: Can't resolve 'graphql-request'**: Resolved by running `npm install` inside the `frontend` folder. Next.js dev server may require a restart to pick up the newly installed module.
* **Empty course list (Hiển thị 0 khóa học)**: Ensure that courses in the `courses` table have `approved_by IS NOT NULL` and `status = 'ACTIVE'`. Non-admin REST/GraphQL queries will silently exclude unapproved/inactive courses.
* **TS2305: react-icons compilation issues**: Avoid importing non-existent Lucide React icons like `LuAlertTriangle` or `LuCheckCircle2`. Use extremely standard icons like `LuCheck`, `LuX`, `LuCalendar`, or write custom inline SVGs to avoid package version mismatches.
