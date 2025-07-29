# Notification Preferences API

## Tổng quan

API này cho phép user quản lý cài đặt thông báo của họ. User có thể bật/tắt các loại thông báo khác nhau.

## Endpoints

### 1. Lấy cài đặt thông báo

**GET** `/user/notification-preferences`

Lấy cài đặt thông báo hiện tại của user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "email": true,
  "push": false,
  "budgetAlerts": true,
  "goalReminders": true,
  "expenseAlerts": true,
  "incomeAlerts": true,
  "weeklyReports": true,
  "monthlyReports": true,
  "achievementCelebrations": true,
  "systemUpdates": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Cập nhật cài đặt thông báo

**POST** `/user/notification-preferences`

Cập nhật cài đặt thông báo của user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "email": true,
  "push": false,
  "budgetAlerts": true,
  "goalReminders": false,
  "expenseAlerts": true,
  "incomeAlerts": true,
  "weeklyReports": false,
  "monthlyReports": true,
  "achievementCelebrations": true,
  "systemUpdates": false
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "email": true,
  "push": false,
  "budgetAlerts": true,
  "goalReminders": false,
  "expenseAlerts": true,
  "incomeAlerts": true,
  "weeklyReports": false,
  "monthlyReports": true,
  "achievementCelebrations": true,
  "systemUpdates": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. Reset cài đặt thông báo

**POST** `/user/notification-preferences/reset`

Reset về cài đặt mặc định.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "email": true,
  "push": false,
  "budgetAlerts": true,
  "goalReminders": true,
  "expenseAlerts": true,
  "incomeAlerts": true,
  "weeklyReports": true,
  "monthlyReports": true,
  "achievementCelebrations": true,
  "systemUpdates": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Các loại thông báo

### 1. Email (`email`)
- **Mô tả**: Nhận thông báo qua email
- **Mặc định**: `true`
- **Ví dụ**: Nhắc nhở mục tiêu tài chính, báo cáo tuần/tháng

### 2. Push Notifications (`push`)
- **Mô tả**: Nhận push notifications trên mobile app
- **Mặc định**: `false`
- **Ví dụ**: Thông báo real-time khi có chi tiêu mới

### 3. Budget Alerts (`budgetAlerts`)
- **Mô tả**: Cảnh báo khi vượt budget
- **Mặc định**: `true`
- **Ví dụ**: "Bạn đã vượt 80% budget tháng này"

### 4. Goal Reminders (`goalReminders`)
- **Mô tả**: Nhắc nhở mục tiêu tài chính
- **Mặc định**: `true`
- **Ví dụ**: "Mục tiêu 'Mua xe' sắp đến hạn trong 7 ngày"

### 5. Expense Alerts (`expenseAlerts`)
- **Mô tả**: Thông báo khi có chi tiêu mới
- **Mặc định**: `true`
- **Ví dụ**: "Bạn vừa thêm chi tiêu 'Ăn trưa' - 50,000 VNĐ"

### 6. Income Alerts (`incomeAlerts`)
- **Mô tả**: Thông báo khi có thu nhập mới
- **Mặc định**: `true`
- **Ví dụ**: "Bạn vừa thêm thu nhập 'Lương tháng' - 15,000,000 VNĐ"

### 7. Weekly Reports (`weeklyReports`)
- **Mô tả**: Báo cáo tuần
- **Mặc định**: `true`
- **Ví dụ**: "Tóm tắt chi tiêu tuần này: 2,500,000 VNĐ"

### 8. Monthly Reports (`monthlyReports`)
- **Mô tả**: Báo cáo tháng
- **Mặc định**: `true`
- **Ví dụ**: "Báo cáo tài chính tháng 12/2024"

### 9. Achievement Celebrations (`achievementCelebrations`)
- **Mô tả**: Chúc mừng khi đạt thành tựu
- **Mặc định**: `true`
- **Ví dụ**: "🎉 Chúc mừng! Bạn đã đạt mục tiêu 'Tiết kiệm 10 triệu'"

### 10. System Updates (`systemUpdates`)
- **Mô tả**: Cập nhật hệ thống
- **Mặc định**: `true`
- **Ví dụ**: "Hệ thống sẽ bảo trì từ 2:00-4:00 sáng mai"

## Cách sử dụng với Frontend

### React Hook Example

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  budgetAlerts: boolean;
  goalReminders: boolean;
  expenseAlerts: boolean;
  incomeAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  achievementCelebrations: boolean;
  systemUpdates: boolean;
}

const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: false,
    budgetAlerts: true,
    goalReminders: true,
    expenseAlerts: true,
    incomeAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    achievementCelebrations: true,
    systemUpdates: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get('/user/notification-preferences', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await axios.post('/user/notification-preferences', newPreferences, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPreferences(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const resetPreferences = async () => {
    try {
      const response = await axios.post('/user/notification-preferences/reset', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPreferences(response.data);
      return response.data;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    updatePreferences,
    resetPreferences,
    refetch: fetchPreferences
  };
};

export default useNotificationPreferences;
```

### React Component Example

```typescript
import React from 'react';
import useNotificationPreferences from './useNotificationPreferences';

const NotificationSettings: React.FC = () => {
  const { preferences, loading, updatePreferences, resetPreferences } = useNotificationPreferences();

  const handleToggle = async (key: keyof typeof preferences) => {
    try {
      await updatePreferences({ [key]: !preferences[key] });
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  const handleReset = async () => {
    try {
      await resetPreferences();
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="notification-settings">
      <h2>Cài đặt thông báo</h2>
      
      <div className="setting-group">
        <h3>Kênh thông báo</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.email}
            onChange={() => handleToggle('email')}
          />
          Email
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.push}
            onChange={() => handleToggle('push')}
          />
          Push Notifications
        </label>
      </div>

      <div className="setting-group">
        <h3>Loại thông báo</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.budgetAlerts}
            onChange={() => handleToggle('budgetAlerts')}
          />
          Cảnh báo budget
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.goalReminders}
            onChange={() => handleToggle('goalReminders')}
          />
          Nhắc nhở mục tiêu
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.expenseAlerts}
            onChange={() => handleToggle('expenseAlerts')}
          />
          Thông báo chi tiêu
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.incomeAlerts}
            onChange={() => handleToggle('incomeAlerts')}
          />
          Thông báo thu nhập
        </label>
      </div>

      <div className="setting-group">
        <h3>Báo cáo</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.weeklyReports}
            onChange={() => handleToggle('weeklyReports')}
          />
          Báo cáo tuần
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.monthlyReports}
            onChange={() => handleToggle('monthlyReports')}
          />
          Báo cáo tháng
        </label>
      </div>

      <div className="setting-group">
        <h3>Khác</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.achievementCelebrations}
            onChange={() => handleToggle('achievementCelebrations')}
          />
          Chúc mừng thành tựu
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.systemUpdates}
            onChange={() => handleToggle('systemUpdates')}
          />
          Cập nhật hệ thống
        </label>
      </div>

      <button onClick={handleReset} className="reset-button">
        Reset về mặc định
      </button>
    </div>
  );
};

export default NotificationSettings;
```

## Lưu ý

1. **Tự động tạo preferences**: Khi user truy cập lần đầu, hệ thống sẽ tự động tạo preferences với giá trị mặc định.

2. **Kiểm tra preferences**: Trước khi gửi thông báo, hệ thống sẽ kiểm tra preferences của user để quyết định có gửi hay không.

3. **Logging**: Tất cả các thao tác với preferences đều được log để debug.

4. **Error handling**: Nếu có lỗi khi kiểm tra preferences, hệ thống sẽ mặc định gửi thông báo để đảm bảo user không bỏ lỡ thông tin quan trọng.

5. **Performance**: Preferences được cache để tối ưu performance khi kiểm tra nhiều lần. 