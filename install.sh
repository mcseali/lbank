#!/bin/bash

# رنگ‌ها برای نمایش بهتر پیام‌ها
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Starting LBank installation...${NC}"

# بررسی اجرا با دسترسی روت
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root (use sudo)${NC}" 
   exit 1
fi

# دریافت تنظیمات اولیه
echo -e "${BLUE}Please provide the following information:${NC}"
read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
read -p "Enter database password for lbank user: " DB_PASSWORD
read -p "Enter secret key for Django: " DJANGO_SECRET_KEY
read -p "Enter API key for LBank: " LBANK_API_KEY
read -p "Enter API secret for LBank: " LBANK_API_SECRET
read -p "Enter email host (e.g., smtp.gmail.com): " EMAIL_HOST
read -p "Enter email port (e.g., 587): " EMAIL_PORT
read -p "Enter email username: " EMAIL_USERNAME
read -p "Enter email password: " EMAIL_PASSWORD
read -p "Enter email from address: " EMAIL_FROM

# آپدیت پکیج‌ها
echo -e "${BLUE}Updating package lists...${NC}"
apt update
apt upgrade -y

# نصب پیش‌نیازها
echo -e "${BLUE}Installing system dependencies...${NC}"
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib redis-server supervisor git certbot python3-certbot-nginx

# نصب Node.js و npm
echo -e "${BLUE}Installing Node.js and npm...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# ایجاد کاربر برای اجرای برنامه
echo -e "${BLUE}Creating application user...${NC}"
useradd -m -s /bin/bash lbank
usermod -aG sudo lbank

# ایجاد دایرکتوری‌های مورد نیاز
echo -e "${BLUE}Creating required directories...${NC}"
mkdir -p /var/www/lbank
chown -R lbank:lbank /var/www/lbank

# کلون کردن مخزن
echo -e "${BLUE}Cloning repository...${NC}"
cd /var/www/lbank
su - lbank -c "git clone https://github.com/7766112092/lbank.git ."

# ایجاد محیط مجازی پایتون
echo -e "${BLUE}Setting up Python virtual environment...${NC}"
su - lbank -c "python3 -m venv /var/www/lbank/venv"
su - lbank -c "source /var/www/lbank/venv/bin/activate && pip install -r /var/www/lbank/backend/requirements.txt"

# تنظیم دیتابیس
echo -e "${BLUE}Setting up PostgreSQL database...${NC}"
su - postgres -c "psql -c \"CREATE DATABASE lbank;\""
su - postgres -c "psql -c \"CREATE USER lbank WITH PASSWORD '${DB_PASSWORD}';\""
su - postgres -c "psql -c \"ALTER ROLE lbank SET client_encoding TO 'utf8';\""
su - postgres -c "psql -c \"ALTER ROLE lbank SET default_transaction_isolation TO 'read committed';\""
su - postgres -c "psql -c \"ALTER ROLE lbank SET timezone TO 'UTC';\""
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE lbank TO lbank;\""

# تنظیمات بک‌اند
echo -e "${BLUE}Configuring backend settings...${NC}"
cat > /var/www/lbank/backend/config/settings.py << EOL
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = '${DJANGO_SECRET_KEY}'

DEBUG = False

ALLOWED_HOSTS = ['${DOMAIN_NAME}', 'www.${DOMAIN_NAME}']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'users',
    'trading',
    'portfolio',
    'wallet',
    'api',
    'backtesting',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'lbank',
        'USER': 'lbank',
        'PASSWORD': '${DB_PASSWORD}',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'fa'
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = '${EMAIL_HOST}'
EMAIL_PORT = ${EMAIL_PORT}
EMAIL_USE_TLS = True
EMAIL_HOST_USER = '${EMAIL_USERNAME}'
EMAIL_HOST_PASSWORD = '${EMAIL_PASSWORD}'
DEFAULT_FROM_EMAIL = '${EMAIL_FROM}'

# LBank API settings
LBANK_API_KEY = '${LBANK_API_KEY}'
LBANK_API_SECRET = '${LBANK_API_SECRET}'

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://${DOMAIN_NAME}",
    "https://www.${DOMAIN_NAME}",
]

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
EOL

# تنظیمات فرانت‌اند
echo -e "${BLUE}Configuring frontend environment variables...${NC}"
cat > /var/www/lbank/frontend/.env << EOL
REACT_APP_API_URL=https://${DOMAIN_NAME}/api
REACT_APP_WS_URL=wss://${DOMAIN_NAME}/ws
REACT_APP_LBANK_API_KEY=${LBANK_API_KEY}
REACT_APP_LBANK_API_SECRET=${LBANK_API_SECRET}
EOL

# کپی فایل‌های تنظیمات
echo -e "${BLUE}Copying configuration files...${NC}"
cat > /etc/nginx/sites-available/lbank << EOL
server {
    listen 80;
    server_name ${DOMAIN_NAME};

    location / {
        root /var/www/lbank/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /static {
        alias /var/www/lbank/backend/static;
    }

    location /media {
        alias /var/www/lbank/backend/media;
    }
}
EOL

ln -s /etc/nginx/sites-available/lbank /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# تنظیم Supervisor
cat > /etc/supervisor/conf.d/lbank.conf << 'EOL'
[program:lbank]
command=/var/www/lbank/venv/bin/gunicorn config.wsgi:application --workers 3 --bind 127.0.0.1:8000
directory=/var/www/lbank/backend
user=lbank
autostart=true
autorestart=true
stderr_logfile=/var/log/lbank.err.log
stdout_logfile=/var/log/lbank.out.log
EOL

# نصب و بیلد فرانت‌اند
echo -e "${BLUE}Building frontend...${NC}"
cd /var/www/lbank/frontend
su - lbank -c "cd /var/www/lbank/frontend && npm install && npm run build"

# اجرای مایگریشن‌ها و ایجاد کاربر مدیر
echo -e "${BLUE}Running database migrations and creating admin user...${NC}"
cd /var/www/lbank/backend
su - lbank -c "source /var/www/lbank/venv/bin/activate && cd /var/www/lbank/backend && python scripts/setup.py"

# راه‌اندازی مجدد سرویس‌ها
echo -e "${BLUE}Restarting services...${NC}"
systemctl restart nginx
systemctl restart supervisor

# نصب SSL با Let's Encrypt
echo -e "${BLUE}Installing SSL certificate...${NC}"
certbot --nginx -d ${DOMAIN_NAME} --non-interactive --agree-tos --email admin@${DOMAIN_NAME} --redirect

# تنظیم تمدید خودکار گواهینامه SSL
echo -e "${BLUE}Setting up automatic SSL renewal...${NC}"
(crontab -l 2>/dev/null | grep -q "certbot renew") || (crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet") | crontab -

# نمایش اطلاعات نهایی
echo -e "${GREEN}Installation completed successfully!${NC}"
echo -e "${GREEN}Your application is now available at:${NC}"
echo -e "https://${DOMAIN_NAME}"
echo -e "\nAdmin user credentials:"
echo -e "Username: admin"
echo -e "Password: admin123"
echo -e "\n${RED}IMPORTANT: Please change the admin password after first login!${NC}"
echo -e "\n${YELLOW}SSL certificate will be automatically renewed every day at midnight.${NC}" 