# سیستم معاملات خودکار LBank

یک سیستم معاملات خودکار برای صرافی LBank با تحلیل بازار مبتنی بر هوش مصنوعی.

## ویژگی‌ها

- 🔐 احراز هویت کاربران
- 🔑 مدیریت کلیدهای API
- 🤖 تحلیل بازار با ChatGPT
- 📊 معاملات خودکار
- 📈 مدیریت موقعیت‌ها
- 📊 شاخص‌های تحلیل تکنیکال
- 🔄 نظارت بر داده‌های بازار در زمان واقعی
- 🛡️ مدیریت خطا و ثبت رویدادها
- 📱 رابط کاربری واکنش‌گرا به زبان فارسی

## پیش‌نیازها

- Python 3.8 یا بالاتر
- Node.js 18 یا بالاتر
- PostgreSQL 13 یا بالاتر
- Docker و Docker Compose (اختیاری)
- کلید API OpenAI
- حساب کاربری LBank با دسترسی API

## نصب روی سرور اوبونتو

### پیش‌نیازها
- اوبونتو 20.04 یا بالاتر
- دسترسی روت یا sudo
- حداقل 2GB RAM
- حداقل 20GB فضای دیسک

### مراحل نصب

1. دانلود اسکریپت نصب:
```bash
wget https://raw.githubusercontent.com/yourusername/lbank/main/install.sh
```

2. دادن دسترسی اجرا به اسکریپت:
```bash
chmod +x install.sh
```

3. اجرای اسکریپت نصب:
```bash
sudo ./install.sh
```

4. پس از نصب، موارد زیر را تنظیم کنید:
   - آدرس دامنه در `/etc/nginx/sites-available/lbank`
   - نصب SSL با Let's Encrypt
   - تنظیمات بک‌اند در `/var/www/lbank/backend/config/settings.py`
   - متغیرهای محیطی فرانت‌اند در `/var/www/lbank/frontend/.env`

5. تغییر رمز عبور کاربر مدیر پس از اولین ورود:
   - نام کاربری: `admin`
   - رمز عبور اولیه: `admin123`

### عیب‌یابی

- مشاهده لاگ‌های بک‌اند:
```bash
tail -f /var/log/lbank.err.log
tail -f /var/log/lbank.out.log
```

- مشاهده لاگ‌های Nginx:
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

- بررسی وضعیت سرویس‌ها:
```bash
systemctl status nginx
systemctl status supervisor
```

## نصب دستی

#### بک‌اند

1. ایجاد محیط مجازی:
   ```bash
   python -m venv venv
   source venv/bin/activate  # در ویندوز: venv\Scripts\activate
   ```

2. نصب وابستگی‌ها:
   ```bash
   pip install -r requirements.txt
   ```

3. کپی کردن فایل محیط:
   ```bash
   cp .env.example .env
   ```

4. ویرایش فایل `.env` و تنظیم مقادیر مورد نیاز

5. اجرای برنامه:
   ```bash
   uvicorn backend.main:app --reload
   ```

#### فرانت‌اند

1. نصب وابستگی‌ها:
   ```bash
   cd frontend
   npm install
   ```

2. اجرای برنامه:
   ```bash
   npm start
   ```

## استفاده

1. باز کردن مرورگر و رفتن به آدرس `http://localhost:3000`

2. ثبت‌نام در سیستم

3. ورود کلیدهای API LBank در بخش تنظیمات

4. انتخاب جفت ارز و تنظیمات معاملاتی

5. شروع معاملات خودکار

## امنیت

- رمزنگاری کلیدهای API
- احراز هویت JWT
- محدودیت نرخ درخواست
- محافظت CORS
- اعتبارسنجی ورودی
- ثبت رویدادهای امنیتی

## توسعه

### ساختار پروژه

```
lbank-trading-bot/
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   └── trading.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── tests/
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

### اجرای تست‌ها

```bash
# اجرای تمام تست‌ها
pytest

# اجرای تست‌های واحد
pytest tests/unit

# اجرای تست‌های یکپارچگی
pytest tests/integration

# اجرای تست‌ها با پوشش کد
pytest --cov=backend tests/
```

## مجوز

این پروژه تحت مجوز MIT منتشر شده است. برای جزئیات بیشتر، فایل [LICENSE](LICENSE) را ببینید.

## مشارکت

برای مشارکت در پروژه، لطفاً [CONTRIBUTING.md](CONTRIBUTING.md) را مطالعه کنید.

## امنیت

برای گزارش آسیب‌پذیری‌های امنیتی، لطفاً [SECURITY.md](SECURITY.md) را مطالعه کنید. 