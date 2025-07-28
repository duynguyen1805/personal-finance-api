# Hướng dẫn cấu hình Google OAuth2 cho Gmail

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable Gmail API:
   - Vào "APIs & Services" > "Library"
   - Tìm "Gmail API" và enable

## Bước 2: Tạo OAuth2 Credentials

1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Chọn "Web application"
4. Đặt tên cho client
5. Thêm Authorized redirect URIs:
   - `https://developers.google.com/oauthplayground`
   - `http://localhost:3000/auth/google/callback` (cho development)

## Bước 3: Lấy Refresh Token

### Cách 1: Sử dụng Google OAuth Playground

1. Truy cập [Google OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click settings icon (⚙️) ở góc phải
3. Check "Use your own OAuth credentials"
4. Nhập Client ID và Client Secret từ bước 2
5. Close settings
6. Chọn scope: `https://mail.google.com/`
7. Click "Authorize APIs"
8. Click "Exchange authorization code for tokens"
9. Copy Refresh Token

### Cách 2: Sử dụng script tự động

```bash
# Chạy script test
node scripts/test-google-oauth.js
```

## Bước 4: Cấu hình Environment Variables

Thêm vào file `.env`:

```env
# Google App Mail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_ACCESS_TOKEN=your-access-token

# Email Provider
EMAIL_PROVIDER=GOOGLE_APP_MAIL
IS_SEND_EMAIL=true
```

## Bước 5: Test cấu hình

```bash
# Test OAuth2 configuration
node scripts/test-google-oauth.js

# Test email sending
npm run start:dev
# Sau đó gọi API đăng ký để test gửi email
```

## Troubleshooting

### Lỗi "invalid_grant"

**Nguyên nhân:**
- Access token đã hết hạn
- Refresh token không hợp lệ
- Client ID/Secret không đúng

**Giải pháp:**
1. Kiểm tra lại refresh token
2. Đảm bảo Gmail API đã được enable
3. Kiểm tra OAuth scopes có đúng không
4. Thử tạo lại credentials

### Lỗi "access_denied"

**Nguyên nhân:**
- User chưa authorize ứng dụng
- Scopes không đủ quyền

**Giải pháp:**
1. Đảm bảo scope `https://mail.google.com/` đã được chọn
2. Thử authorize lại trong OAuth Playground

### Lỗi "redirect_uri_mismatch"

**Nguyên nhân:**
- Redirect URI không khớp với cấu hình

**Giải pháp:**
1. Kiểm tra redirect URI trong Google Cloud Console
2. Đảm bảo URI khớp với cấu hình

## Scopes cần thiết

- `https://mail.google.com/` - Gửi email
- `https://www.googleapis.com/auth/gmail.send` - Gửi email (alternative)

## Security Notes

1. **Không commit credentials vào git**
2. **Sử dụng environment variables**
3. **Rotate refresh tokens định kỳ**
4. **Monitor API usage**

## Production Setup

1. Sử dụng Google Cloud IAM
2. Enable audit logging
3. Set up monitoring
4. Configure rate limiting 