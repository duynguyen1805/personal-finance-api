# Template Troubleshooting Guide

## Vấn đề: Không đọc được file template trong thư mục dist/src/templates

### Nguyên nhân
Khi build NestJS project, thư mục `templates` không được copy vào `dist` theo mặc định. Điều này gây ra lỗi khi runtime cố gắng tìm file template.

### Giải pháp đã triển khai

#### 1. Cập nhật nest-cli.json
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "assets": [
      {
        "include": "../templates/**/*",
        "outDir": "dist/templates"
      }
    ]
  }
}
```

#### 2. Cập nhật EmailGenerator
- Thêm logic tìm template ở nhiều đường dẫn khác nhau
- Log đường dẫn tìm thấy template để debug
- Throw error chi tiết nếu không tìm thấy

#### 3. Script copy templates
- Tạo script `scripts/copy-templates.js` để copy templates thủ công
- Thêm vào `postbuild` script trong package.json

### Các bước khắc phục

#### Bước 1: Build lại project
```bash
npm run build
```

#### Bước 2: Kiểm tra thư mục dist
```bash
ls -la dist/templates/
```

#### Bước 3: Chạy test để kiểm tra
```bash
npm test email-generator.helper.spec.ts
```

#### Bước 4: Kiểm tra log khi chạy API
Khi gọi API sign up, xem log để biết template được tìm thấy ở đâu:
```
Found template at: /path/to/template.ejs
```

### Debug Steps

#### 1. Kiểm tra cấu trúc thư mục
```bash
# Kiểm tra thư mục gốc
ls -la templates/

# Kiểm tra thư mục dist
ls -la dist/templates/

# Kiểm tra đường dẫn hiện tại
pwd
```

#### 2. Chạy script copy thủ công
```bash
node scripts/copy-templates.js
```

#### 3. Kiểm tra các đường dẫn có thể
EmailGenerator sẽ thử các đường dẫn sau:
- `process.cwd()/templates/email/`
- `process.cwd()/dist/templates/email/`
- `__dirname/../../../templates/email/`
- `__dirname/../../../../templates/email/`

### Các trường hợp có thể xảy ra

#### Trường hợp 1: Development mode
- Template nằm ở `templates/email/`
- EmailGenerator sẽ tìm thấy ở `process.cwd()/templates/email/`

#### Trường hợp 2: Production mode
- Template cần được copy vào `dist/templates/email/`
- EmailGenerator sẽ tìm thấy ở `process.cwd()/dist/templates/email/`

#### Trường hợp 3: Build không copy templates
- Chạy `npm run build` để copy templates
- Hoặc chạy `node scripts/copy-templates.js` thủ công

### Kiểm tra nhanh

#### 1. Test template path
```bash
# Tạo file test đơn giản
node -e "
const path = require('path');
const fs = require('fs');

const possiblePaths = [
  path.join(process.cwd(), 'templates', 'email', 'registration-confirmation.ejs'),
  path.join(process.cwd(), 'dist', 'templates', 'email', 'registration-confirmation.ejs')
];

possiblePaths.forEach(p => {
  console.log(p + ': ' + (fs.existsSync(p) ? 'EXISTS' : 'NOT FOUND'));
});
"
```

#### 2. Test EmailGenerator
```bash
# Chạy test unit
npm test -- --testNamePattern="EmailGenerator"
```

### Lỗi thường gặp

#### Lỗi 1: "Template file not found"
**Nguyên nhân**: Template không được copy vào dist
**Giải pháp**: 
```bash
npm run build
# hoặc
node scripts/copy-templates.js
```

#### Lỗi 2: "Cannot find module 'fs-extra'"
**Nguyên nhân**: Script copy cần fs-extra
**Giải pháp**: 
```bash
npm install fs-extra @types/fs-extra --save-dev
# hoặc sử dụng script đã cập nhật (không cần fs-extra)
```

#### Lỗi 3: "Permission denied"
**Nguyên nhân**: Không có quyền tạo thư mục
**Giải pháp**: 
```bash
sudo chmod -R 755 dist/
# hoặc
mkdir -p dist/templates
```

### Monitoring

#### 1. Log template path
EmailGenerator sẽ log đường dẫn tìm thấy template:
```
Found template at: /path/to/template.ejs
```

#### 2. Log error chi tiết
Nếu không tìm thấy, sẽ log tất cả đường dẫn đã thử:
```
Template file not found: registration-confirmation.ejs. Tried paths: /path1, /path2, ...
```

### Best Practices

#### 1. Luôn build trước khi deploy
```bash
npm run build
```

#### 2. Kiểm tra dist folder
```bash
ls -la dist/templates/email/
```

#### 3. Test email functionality
```bash
npm test email-generator.helper.spec.ts
```

#### 4. Monitor logs
Theo dõi log khi chạy API để đảm bảo template được tìm thấy.

### Rollback Plan

Nếu cần rollback:
1. Xóa `compilerOptions.assets` trong nest-cli.json
2. Xóa `postbuild` script trong package.json
3. Revert EmailGenerator về version cũ
4. Build lại project 