# Auth & Mentor Availability API Documentation

Tài liệu này mô tả các endpoint hiện có trong hai module:

- `src/modules/auth`
- `src/modules/mentor-availability`

Tất cả ví dụ bên dưới đều dựa trên code hiện có trong project, không thêm field ngoài schema/controller/service hiện tại.

---

## Common conventions

### Base URL

Tùy theo cấu hình `API_PREFIX` trong project. Hiện tại app dùng global prefix từ config.

### Auth headers

Các endpoint bảo vệ bằng `JwtAuthGuard` cần:

```http
Authorization: Bearer <access_token>
```

### Roles

- `ADMIN`
- `MENTEE`

---

# 1) Auth module

## 1.1 `GET /auth/google`

### Mục đích

Bắt đầu luồng đăng nhập Google.

### Auth

Không cần token.

### Request

Không body.

### Response

Route này thường redirect sang Google OAuth flow, không phải response JSON chuẩn.

---

## 1.2 `GET /auth/google/callback`

### Mục đích

Endpoint callback sau khi Google xác thực xong.

### Auth

Google callback.

### Request

Không body.

### Response

Luồng trả về phụ thuộc implementation trong `auth.service` và strategy, thường là redirect hoặc set cookie/token.

---

## 1.3 `GET /auth/me`

### Mục đích

Lấy thông tin user hiện tại.

### Auth

- `JwtAuthGuard`

### Request

Không body.

### Response

Dựa theo project, response được build từ `userService.getMe(userId)`.

Ví dụ shape:

```json
{
  "message": "Lấy thông tin người dùng thành công.",
  "user": {
    "id": "user_001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0900000000",
    "avatarUrl": "https://example.com/avatar.png",
    "dayOfBirth": "2000-01-01",
    "gender": "male",
    "role": "MENTEE",
    "points": 0,
    "isVerified": true,
    "status": "ACTIVE",
    "timezone": "Asia/Ho_Chi_Minh",
    "preferences": {},
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

> Lưu ý: ví dụ trên chỉ minh họa theo pattern trong project, field thực tế phụ thuộc `userService.getMe`.

---

## 1.4 `POST /auth/logout`

### Mục đích

Đăng xuất user.

### Auth

- `JwtAuthGuard`

### Request

Không body.

### Response

Tùy theo implementation trong service, thường là message hoặc clear cookie.

---

# 2) Mentor Availability module

## Entity / schema fields hiện có

Các field đang được dùng trong project cho mentor availability:

- `id: string`
- `mentorId: string`
- `approvedBy?: string | null`
- `jobTitle?: string | null`
- `company?: string | null`
- `bio?: string | null`
- `linkedinUrl?: string | null`
- `yearsOfExperience?: number | null`
- `skills: string[]`
- `isActive: boolean`
- `metadata: Record<string, any>`
- `status: MentorAvailabilityStatus`
- `note?: string | null`
- `createdAt: Date`
- `updatedAt: Date`
- `deletedAt?: Date | null`

### Metadata shape khi tạo mới

Trong `createMentorAvailabilitySchema`, `metadata` có cấu trúc:

```json
{
  "certificates": [
    {
      "name": "string",
      "issuedBy": "string",
      "imageUrl": "string"
    }
  ],
  "degrees": [
    {
      "name": "string",
      "university": "string",
      "imageUrl": "string"
    }
  ]
}
```

---

## 2.1 `POST /mentor-availabilities`

### Mục đích

Mentee tạo mới mentor availability.

### Auth / role

- `JwtAuthGuard`
- `RolesGuard`
- `Role.MENTEE`

### Body

Theo `CreateMentorAvailabilityInput`:

- `jobTitle?: string`
- `company?: string`
- `bio?: string`
- `linkedinUrl?: string`
- `yearsOfExperience?: number`
- `skills?: string[]`
- `metadata: { certificates: [...], degrees: [...] }`
- `note?: string`

### Example request

```http
POST /mentor-availabilities
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "jobTitle": "Backend Developer",
  "company": "ABC Company",
  "bio": "I have 3 years of experience in backend development.",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "yearsOfExperience": 3,
  "skills": ["NestJS", "TypeScript", "PostgreSQL"],
  "metadata": {
    "certificates": [
      {
        "name": "NestJS Advanced",
        "issuedBy": "NestJS Academy",
        "imageUrl": "https://example.com/certificates/nestjs.png"
      }
    ],
    "degrees": [
      {
        "name": "Computer Science",
        "university": "ABC University",
        "imageUrl": "https://example.com/degrees/cs.png"
      }
    ]
  },
  "note": "Please review my profile"
}
```

### Response

Service trả về:

```json
{
  "message": "SUCCESS",
  "data": {
    "id": "avl_123",
    "mentorId": "user_456",
    "approvedBy": null,
    "jobTitle": "Backend Developer",
    "company": "ABC Company",
    "bio": "I have 3 years of experience in backend development.",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "yearsOfExperience": 3,
    "skills": ["NestJS", "TypeScript", "PostgreSQL"],
    "isActive": true,
    "metadata": {
      "certificates": [
        {
          "name": "NestJS Advanced",
          "issuedBy": "NestJS Academy",
          "imageUrl": "https://example.com/certificates/nestjs.png"
        }
      ],
      "degrees": [
        {
          "name": "Computer Science",
          "university": "ABC University",
          "imageUrl": "https://example.com/degrees/cs.png"
        }
      ]
    },
    "status": "PENDING",
    "note": "Please review my profile",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

---

## 2.2 `GET /mentor-availabilities`

### Mục đích

Admin xem tất cả mentor availabilities.

### Auth / role

- `JwtAuthGuard`
- `RolesGuard`
- `Role.ADMIN`

### Request

Không body.

### Response

Danh sách `MentorAvailability`.

```json
[
  {
    "id": "avl_123",
    "mentorId": "user_456",
    "approvedBy": null,
    "jobTitle": "Backend Developer",
    "company": "ABC Company",
    "bio": "I have 3 years of experience in backend development.",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "yearsOfExperience": 3,
    "skills": ["NestJS", "TypeScript", "PostgreSQL"],
    "isActive": true,
    "metadata": {},
    "status": "PENDING",
    "note": "Please review my profile",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "deletedAt": null
  }
]
```

---

## 2.3 `GET /mentor-availabilities/me`

### Mục đích

Mentee xem danh sách mentor availability của chính họ.

### Auth / role

- `JwtAuthGuard`
- `RolesGuard`
- `Role.MENTEE`

### Request

Không body.

### Response

Danh sách `MentorAvailability` thuộc về user đang đăng nhập.

```json
[
  {
    "id": "avl_123",
    "mentorId": "user_456",
    "approvedBy": "admin_001",
    "jobTitle": "Backend Developer",
    "company": "ABC Company",
    "bio": "I have 3 years of experience in backend development.",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "yearsOfExperience": 3,
    "skills": ["NestJS", "TypeScript", "PostgreSQL"],
    "isActive": true,
    "metadata": {},
    "status": "IN_PROGRESS",
    "note": "Processing request",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z",
    "deletedAt": null
  }
]
```

---

## 2.4 `GET /mentor-availabilities/:id`

### Mục đích

Admin xem chi tiết một mentor availability.

### Auth / role

- `JwtAuthGuard`
- `RolesGuard`
- `Role.ADMIN`

### Path param

- `id: string`

### Request

Không body.

### Response

Một `MentorAvailability` object.

```json
{
  "id": "avl_123",
  "mentorId": "user_456",
  "approvedBy": "admin_001",
  "jobTitle": "Backend Developer",
  "company": "ABC Company",
  "bio": "I have 3 years of experience in backend development.",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "yearsOfExperience": 3,
  "skills": ["NestJS", "TypeScript", "PostgreSQL"],
  "isActive": true,
  "metadata": {},
  "status": "APPROVED",
  "note": "Approved after review",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-02T00:00:00.000Z",
  "deletedAt": null
}
```

---

## 2.5 `GET /mentor-availabilities/me/:id`

### Mục đích

Mentee xem chi tiết mentor availability của chính họ.

### Auth / role

- `JwtAuthGuard`
- `RolesGuard`
- `Role.MENTEE`

### Path param

- `id: string`

### Request

Không body.

### Response

Một `MentorAvailability` object nếu record thuộc về user hiện tại.

```json
{
  "id": "avl_123",
  "mentorId": "user_456",
  "approvedBy": null,
  "jobTitle": "Backend Developer",
  "company": "ABC Company",
  "bio": "I have 3 years of experience in backend development.",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "yearsOfExperience": 3,
  "skills": ["NestJS", "TypeScript", "PostgreSQL"],
  "isActive": true,
  "metadata": {},
  "status": "PENDING",
  "note": "Please review my profile",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "deletedAt": null
}
```

Nếu `mentorId` không khớp với user đang đăng nhập, API trả `NotFoundException`.

---

## 2.6 `PATCH /mentor-availabilities/:id`

### Mục đích

Update thông tin mentor availability.

### Auth / role

Hiện tại controller đang không gắn guard riêng cho route này trong code hiện có.

### Path param

- `id: string`

### Body

Theo `UpdateMentorAvailabilityInput`:

- `jobTitle?: string`
- `company?: string`
- `bio?: string`
- `linkedinUrl?: string`
- `yearsOfExperience?: number`
- `skills?: string[]`
- `metadata?: { certificates: [...], degrees: [...] }`
- `note?: string`
- `status?: MentorAvailabilityStatus`
- `approvedBy?: string`
- `isActive?: boolean`

### Response

Một `MentorAvailability` object sau khi update.

---

## 2.7 `PATCH /mentor-availabilities/:id/in-progress`

### Mục đích

Admin chuyển trạng thái từ `PENDING` sang `IN_PROGRESS`.

### Auth / role

- `JwtAuthGuard`
- `RolesGuard`
- `Role.ADMIN`

### Path param

- `id: string`

### Body

Không body.

### Response

Một `MentorAvailability` object với:

- `status = "IN_PROGRESS"`
- `approvedBy = adminId`

---

## 2.8 `PATCH /mentor-availabilities/:id/approved`

### Mục đích

Admin duyệt mentor availability.

### Auth / role

- `JwtAuthGuard`
- `RolesGuard`
- `Role.ADMIN`

### Path param

- `id: string`

### Body

Bắt buộc có:

- `note: string`

### Response

Một `MentorAvailability` object với:

- `status = "APPROVED"`
- `note` được lưu theo payload

---

## 2.9 `PATCH /mentor-availabilities/:id/rejected`

### Mục đích

Admin từ chối mentor availability.

### Auth / role

- `JwtAuthGuard`
- `RolesGuard`
- `Role.ADMIN`

### Path param

- `id: string`

### Body

Bắt buộc có:

- `note: string`

### Response

Một `MentorAvailability` object với:

- `status = "REJECTED"`
- `note` được lưu theo payload

---

## 2.10 `PATCH /mentor-availabilities/:id/cancel`

### Mục đích

Mentee hủy mentor availability của chính họ.

### Auth / role

- `JwtAuthGuard`
- `RolesGuard`
- `Role.MENTEE`

### Path param

- `id: string`

### Body

Không body.

### Response

Một `MentorAvailability` object với:

- `status = "CANCEL"`

---

## 2.11 `DELETE /mentor-availabilities/:id`

### Mục đích

Soft delete mentor availability.

### Auth

Hiện tại route này chưa có guard riêng trong controller hiện có.

### Path param

- `id: string`

### Response

Không rõ payload trả về từ service, nhưng service gọi `softDeleteById(id)`.

---

# 3) Status values hiện có

Từ enum `MentorAvailabilityStatus`:

- `PENDING`
- `IN_PROGRESS`
- `APPROVED`
- `REJECTED`
- `CANCEL`

---

# 4) Rule nghiệp vụ hiện có trong code

## Create

- một `mentorId` không được có đồng thời application ở trạng thái:
  - `PENDING`
  - `IN_PROGRESS`

## Transition

- `PENDING -> IN_PROGRESS` chỉ admin
- `IN_PROGRESS -> APPROVED` chỉ admin
- `IN_PROGRESS -> REJECTED` chỉ admin
- `PENDING -> CANCEL` chỉ mentee sở hữu record

## Ownership

- `GET /mentor-availabilities/me`
  - chỉ lấy record của mentee đang đăng nhập
- `GET /mentor-availabilities/me/:id`
  - chỉ xem được nếu `mentorId` trùng user hiện tại

---

# 5) Suggested response examples for FE

## Success response pattern

Một số endpoint trả object trực tiếp, một số endpoint trả wrapper:

### Wrapper example

```json
{
  "message": "SUCCESS",
  "data": {
    "...": "..."
  }
}
```

### Direct object example

```json
{
  "id": "avl_123",
  "mentorId": "user_456",
  "status": "PENDING"
}
```

---

Nếu bạn muốn, mình có thể tiếp tục tách tài liệu này thành 2 file riêng trong `docs`:

- `docs/auth-api.md`
- `docs/mentor-availability-api.md`

để FE đọc dễ hơn.
