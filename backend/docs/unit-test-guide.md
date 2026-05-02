# Hướng dẫn viết Unit Test trong NestJS

Tài liệu này hướng dẫn cách viết Unit Test cho các Service trong dự án, tập trung vào việc sử dụng **Mocks** và kiểm tra logic xử lý nghiệp vụ mà không cần kết nối Database thật.

## 1. Khái niệm cơ bản

### Unit Test là gì?
Unit Test là việc kiểm tra một "đơn vị" mã nguồn nhỏ nhất (thường là một hàm hoặc một class) trong sự cô lập hoàn toàn.

### Tại sao dùng Mock?
Vì Service thường phụ thuộc vào Database (Repository) hoặc các Service khác. Để test nhanh và độc lập, ta thay thế các phụ thuộc này bằng các **bản sao giả lập (Mocks)**.

---

## 2. Công cụ sử dụng
- **Jest**: Framework chạy test mặc định của NestJS.
- **@nestjs/testing**: Thư viện hỗ trợ tạo module test cho NestJS.

---

## 3. Cấu trúc một file Unit Test (Spec)

File test thường nằm cùng thư mục với file service và có đuôi `.spec.ts`.

### Bước 1: Khởi tạo Mock và Module
Trong `beforeEach`, ta tạo các đối tượng giả lập và đưa vào module test.

```typescript
beforeEach(async () => {
  // 1. Tạo EntityManager giả để mô phỏng DB
  mockEntityManager = {
    create: jest.fn().mockImplementation((entity, data) => ({ ...data, id: 'mock-id' })),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  // 2. Tạo DataSource giả để mô phỏng Transaction
  mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
  };

  // 3. Tạo module test
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      CourseService,
      { provide: CourseRepository, useValue: {} },
      { provide: DataSource, useValue: mockDataSource },
    ],
  }).compile();

  service = module.get<CourseService>(CourseService);
});
```

### Bước 2: Viết các Test Case (`describe` và `it`)
Mỗi test case nên tập trung vào một kịch bản cụ thể.

#### Kiểm tra logic Tạo dữ liệu
Mục tiêu là xác nhận Service có gọi lệnh lưu vào DB với đúng dữ liệu không.

```typescript
it('should create a course and its category associations', async () => {
  const payload = { title: 'NestJS Test', price: 100, categoryIds: ['cat-1'] };
  
  await service.create(payload, 'mentor-1');

  // Kiểm tra xem transaction có được gọi không
  expect(mockDataSource.transaction).toHaveBeenCalled();
  
  // Kiểm tra xem có lưu đúng dữ liệu không
  expect(mockEntityManager.save).toHaveBeenCalledWith(CourseEntity, expect.objectContaining({
    title: 'NestJS Test',
    mentorId: 'mentor-1'
  }));
});
```

#### Kiểm tra logic Cập nhật dữ liệu
Mục tiêu là kiểm tra việc truy vấn dữ liệu cũ và thực hiện các thay đổi (ví dụ: xóa category cũ, thêm mới).

```typescript
it('should refresh category associations during update', async () => {
  // Giả lập tìm thấy dữ liệu cũ
  mockEntityManager.findOne.mockResolvedValue({ id: '1', title: 'Old' });

  await service.update('1', { categoryIds: ['new-cat'] });

  // Kiểm tra xem có lệnh xóa category cũ không
  expect(mockEntityManager.delete).toHaveBeenCalledWith(CourseCategoryEntity, { courseId: '1' });
});
```

---

## 4. Cách chạy Test

- **Chạy tất cả các test**:
  ```bash
  npm test
  ```
- **Chạy một file cụ thể**:
  ```bash
  npx jest src/modules/course/services/course.service.spec.ts
  ```
- **Chạy ở chế độ watch (tự động chạy lại khi sửa code)**:
  ```bash
  npm run test:watch
  ```

---

## 5. Quy tắc vàng khi viết Unit Test
1. **Cô lập (Isolation)**: Một bài test không nên phụ thuộc vào bài test khác.
2. **Nhanh (Fast)**: Unit test phải chạy trong vài mili giây.
3. **Rõ ràng (Clear)**: Tên bài test (`it(...)`) phải mô tả đúng hành vi mong đợi.
4. **Kiểm tra biên (Edge cases)**: Hãy luôn test các trường hợp lỗi (ví dụ: không tìm thấy ID, dữ liệu null, ...).

---

## 6. Giải thích luồng hoạt động của Transaction Test
Khi Service sử dụng `this.dataSource.transaction(...)`:
1. Trong file test, ta "đánh tráo" hàm `transaction` bằng một hàm ảo (`jest.fn()`).
2. Hàm ảo này sẽ nhận đoạn code xử lý của Service (callback) và thực thi nó ngay lập tức.
3. Nó truyền vào đoạn code đó một `EntityManager` giả mà ta đã chuẩn bị sẵn.
4. Nhờ đó, ta có thể đứng từ ngoài và dùng `expect` để soi xem đoạn code bên trong Transaction đã làm những gì với `EntityManager` đó.
