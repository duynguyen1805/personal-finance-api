# Financial Goals & Notification System Implementation

## Tổng quan

Dự án Personal Finance API đã được mở rộng với module Financial Goals và hệ thống thông báo tự động. Hệ thống này giúp người dùng theo dõi mục tiêu tài chính và nhận thông báo khi deadline sắp đến.

## Tính năng đã triển khai

### 1. Financial Goals Module

#### API Endpoints

- `POST /financial-goals/create` - Tạo mục tiêu tài chính mới
- `GET /financial-goals/get-all` - Lấy tất cả mục tiêu của user
- `GET /financial-goals/upcoming?days=30` - Lấy mục tiêu sắp đến hạn
- `GET /financial-goals/:id` - Lấy chi tiết mục tiêu cụ thể
- `PATCH /financial-goals/:id` - Cập nhật mục tiêu
- `DELETE /financial-goals/:id` - Xóa mục tiêu

#### Dữ liệu mục tiêu

```typescript
{
  goalId: number;
  userId: number;
  goalName: string; // Tên mục tiêu
  targetAmount: number; // Số tiền mục tiêu
  deadline: Date; // Ngày hạn chót
  autoDeduct: boolean; // Tự động trừ tiền
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Notification System

#### Loại thông báo

- **EMAIL**: Gửi email qua Google App Mail
- **PUSH**: Push notification (đang phát triển)
- **IN_APP**: Thông báo trong ứng dụng

#### Trạng thái thông báo

- **PENDING**: Chờ gửi
- **SENT**: Đã gửi thành công
- **FAILED**: Gửi thất bại
- **READ**: Đã đọc

#### API Endpoints

- `GET /notifications?limit=50` - Lấy thông báo của user
- `GET /notifications/unread-count` - Số thông báo chưa đọc
- `PATCH /notifications/:id/read` - Đánh dấu đã đọc
- `DELETE /notifications/:id` - Xóa thông báo
- `POST /notifications/send` - Gửi thông báo thủ công (testing)

### 3. Scheduled Tasks

Hệ thống tự động chạy các task sau:

#### 9:00 AM - Kiểm tra deadline hàng ngày

- Quét tất cả mục tiêu sắp đến hạn trong 30 ngày
- Gửi thông báo phù hợp dựa trên mức độ khẩn cấp:
  - **≤ 1 ngày**: Thông báo khẩn cấp qua email
  - **≤ 7 ngày**: Thông báo tuần qua in-app
  - **≤ 14 ngày**: Thông báo tháng qua in-app

#### 10:00 AM - Nhắc nhở tuần

- Gửi email tóm tắt các mục tiêu sắp đến hạn trong 7 ngày

#### 2:00 PM - Nhắc nhở khẩn cấp

- Gửi thông báo khẩn cấp cho mục tiêu đến hạn trong 1 ngày

## Cách sử dụng

### 1. Tạo mục tiêu tài chính

```bash
POST /financial-goals/create
Authorization: Bearer <token>

{
  "goalName": "Mua xe hơi",
  "targetAmount": 500000000,
  "deadline": "2024-12-31T00:00:00.000Z",
  "autoDeduct": true
}
```

### 2. Xem mục tiêu sắp đến hạn

```bash
GET /financial-goals/upcoming?days=30
Authorization: Bearer <token>
```

### 3. Xem thông báo

```bash
GET /notifications?limit=20
Authorization: Bearer <token>
```

### 4. Đánh dấu đã đọc

```bash
PATCH /notifications/123/read
Authorization: Bearer <token>
```

## Cấu hình

### Environment Variables

Đảm bảo các biến môi trường sau đã được cấu hình:

```env
# Email Configuration
EMAIL_PROVIDER=GOOGLE_APP_MAIL
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_ACCESS_TOKEN=your-access-token

# App Configuration
BASE_URL=http://localhost:3000
NODE_ENV=development
```

### Database Migration

Chạy migration để tạo bảng notifications:

```bash
npm run typeorm:migration:run
```

## Template Email

Template email được tạo tại `templates/email/financial-goal-reminder.ejs` với:

- Thiết kế responsive
- Hỗ trợ tiếng Việt
- Hiển thị thông tin mục tiêu chi tiết
- Cảnh báo dựa trên mức độ khẩn cấp
- Nút call-to-action để xem chi tiết

## Monitoring & Logging

### Logs

- Tất cả hoạt động notification được log với level phù hợp
- Lỗi gửi notification được ghi log chi tiết
- Scheduled tasks có log start/end

### Monitoring

- Số lượng notification được gửi
- Tỷ lệ thành công/thất bại
- Performance của scheduled tasks

## Troubleshooting

### 1. Email không gửi được

- Kiểm tra cấu hình Google App Mail
- Verify refresh token còn hạn
- Check logs trong `notification-scheduler.service.ts`

### 2. Scheduled tasks không chạy

- Đảm bảo `ScheduleModule` đã được import
- Kiểm tra timezone của server
- Verify cron expressions

### 3. Database errors

- Chạy migration: `npm run typeorm:migration:run`
- Kiểm tra kết nối database
- Verify entity relationships

## Roadmap

### Phase 3 - Advanced Features

1. **Firebase Cloud Messaging** - Push notifications
2. **Progress Tracking** - Theo dõi tiến độ mục tiêu
3. **Auto-deduct** - Tự động trừ tiền từ thu nhập
4. **Goal Categories** - Phân loại mục tiêu
5. **Achievement Celebrations** - Chúc mừng khi đạt mục tiêu
6. **Analytics & Reporting** - Báo cáo và phân tích

### Technical Improvements

1. **Real-time Notifications** - WebSocket integration
2. **Notification Preferences** - Cài đặt thông báo cá nhân
3. **Batch Processing** - Xử lý hàng loạt cho performance
4. **Retry Mechanism** - Cơ chế thử lại khi gửi thất bại
5. **Rate Limiting** - Giới hạn tần suất gửi notification

## Contributing

Khi thêm tính năng mới:

1. Tạo DTOs với validation
2. Thêm Swagger documentation
3. Viết unit tests
4. Cập nhật migration nếu cần
5. Thêm logging phù hợp
6. Cập nhật documentation

## Support

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra logs trong console
2. Verify cấu hình environment variables
3. Test API endpoints với Postman
4. Check database connection và migrations
