#!/bin/bash

# رنگ‌ها برای نمایش بهتر پیام‌ها
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting LBank installation...${NC}"

# بررسی اجرا با دسترسی روت
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root (use sudo)${NC}" 
   exit 1
fi

# آپدیت پکیج‌ها
echo -e "${BLUE}Updating package lists...${NC}"
apt update
apt upgrade -y

# نصب پیش‌نیازها
echo -e "${BLUE}Installing system dependencies...${NC}"
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib redis-server supervisor git

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
su - lbank -c "git clone https://github.com/yourusername/lbank.git ."

# ایجاد محیط مجازی پایتون
echo -e "${BLUE}Setting up Python virtual environment...${NC}"
su - lbank -c "python3 -m venv /var/www/lbank/venv"
su - lbank -c "source /var/www/lbank/venv/bin/activate && pip install -r /var/www/lbank/backend/requirements.txt"

# تنظیم دیتابیس
echo -e "${BLUE}Setting up PostgreSQL database...${NC}"
su - postgres -c "psql -c \"CREATE DATABASE lbank;\""
su - postgres -c "psql -c \"CREATE USER lbank WITH PASSWORD 'lbank123';\""
su - postgres -c "psql -c \"ALTER ROLE lbank SET client_encoding TO 'utf8';\""
su - postgres -c "psql -c \"ALTER ROLE lbank SET default_transaction_isolation TO 'read committed';\""
su - postgres -c "psql -c \"ALTER ROLE lbank SET timezone TO 'UTC';\""
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE lbank TO lbank;\""

# کپی فایل‌های تنظیمات
echo -e "${BLUE}Copying configuration files...${NC}"
cat > /etc/nginx/sites-available/lbank << 'EOL'
server {
    listen 80;
    server_name your_domain.com;

    location / {
        root /var/www/lbank/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
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

# نمایش اطلاعات نهایی
echo -e "${GREEN}Installation completed successfully!${NC}"
echo -e "${GREEN}Please update the following:${NC}"
echo -e "1. Update server_name in /etc/nginx/sites-available/lbank"
echo -e "2. Configure SSL using Let's Encrypt"
echo -e "3. Update backend settings in /var/www/lbank/backend/config/settings.py"
echo -e "4. Update frontend environment variables in /var/www/lbank/frontend/.env"
echo -e "\nAdmin user credentials:"
echo -e "Username: admin"
echo -e "Password: admin123"
echo -e "\n${RED}IMPORTANT: Please change the admin password after first login!${NC}" 