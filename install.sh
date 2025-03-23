#!/bin/bash

# Colors for better display
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Starting LBank installation...${NC}"

# Check for root access
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root (use sudo)${NC}" 
   exit 1
fi

# Get initial settings
echo -e "${BLUE}Please provide the following information:${NC}"

echo -e "\n${YELLOW}=== Server Settings ===${NC}"
echo -e "The domain where you want to install the site"
read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME

echo -e "\n${YELLOW}=== Database Settings ===${NC}"
echo -e "Password for database access (keep this in a secure place)"
read -p "Enter database password for lbank user: " DB_PASSWORD

echo -e "\n${YELLOW}=== Security Settings ===${NC}"
echo -e "Secret key for data encryption (enter a long random string)"
read -p "Enter secret key for Django: " DJANGO_SECRET_KEY

echo -e "\n${YELLOW}=== LBank Exchange API Settings ===${NC}"
echo -e "These keys are used to connect to your LBank exchange account and perform trades"
echo -e "You can get these keys from your LBank user panel at: https://www.lbank.com/en-US/user/api/"
read -p "Enter API key for LBank: " LBANK_API_KEY
read -p "Enter API secret for LBank: " LBANK_API_SECRET

echo -e "\n${YELLOW}=== Email Service Settings ===${NC}"
echo -e "These settings are used for system emails such as:"
echo -e "- User registration confirmation"
echo -e "- Password recovery"
echo -e "- Important trade notifications"
echo -e "- Security alerts"

echo -e "\n${GREEN}For Gmail users:${NC}"
echo -e "Host: smtp.gmail.com"
echo -e "Port: 587"
echo -e "To use Gmail, you need to:"
echo -e "1. Enable Two-factor authentication"
echo -e "2. Create an App Password"
echo -e "3. Use the App Password instead of your main Gmail password"

read -p "Enter email host (e.g., smtp.gmail.com): " EMAIL_HOST
read -p "Enter email port (default: 587): " EMAIL_PORT
EMAIL_PORT=${EMAIL_PORT:-587}  # Use 587 if empty

echo -e "\nEmail username (for Gmail: complete email address)"
read -p "Enter email username: " EMAIL_USERNAME

echo -e "\nEmail password (for Gmail: App Password)"
read -p "Enter email password: " EMAIL_PASSWORD

echo -e "\nEmail address from which emails will be sent"
read -p "Enter email from address: " EMAIL_FROM

echo -e "\n${YELLOW}=== AI Analysis Settings (Optional) ===${NC}"
echo -e "This key is used for intelligent trade analysis using OpenAI"
echo -e "If you don't want to use this feature, leave it empty"
read -p "Enter OpenAI API key (optional): " OPENAI_API_KEY

# Set ENABLE_AI_ANALYSIS based on OpenAI key presence
if [ -z "$OPENAI_API_KEY" ]; then
    ENABLE_AI_ANALYSIS=false
else
    ENABLE_AI_ANALYSIS=true
fi

# Update package lists
echo -e "${BLUE}Updating package lists...${NC}"
apt update
apt upgrade -y

# Install system dependencies
echo -e "${BLUE}Installing system dependencies...${NC}"
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib redis-server supervisor git certbot python3-certbot-nginx

# Install Node.js and npm
echo -e "${BLUE}Installing Node.js and npm...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Create application user
echo -e "${BLUE}Creating application user...${NC}"
useradd -m -s /bin/bash lbank
usermod -aG sudo lbank

# Create required directories
echo -e "${BLUE}Creating required directories...${NC}"
mkdir -p /var/www/lbank
chown -R lbank:lbank /var/www/lbank

# Clone repository
echo -e "${BLUE}Cloning repository...${NC}"
cd /var/www/lbank
su - lbank -c "git clone https://github.com/7766112092/lbank.git ."

# Set up Python virtual environment
echo -e "${BLUE}Setting up Python virtual environment...${NC}"
su - lbank -c "python3 -m venv /var/www/lbank/venv"
su - lbank -c "source /var/www/lbank/venv/bin/activate && pip install -r /var/www/lbank/backend/requirements.txt"

# Set up PostgreSQL database
echo -e "${BLUE}Setting up PostgreSQL database...${NC}"
su - postgres -c "psql -c \"CREATE DATABASE lbank;\""
su - postgres -c "psql -c \"CREATE USER lbank WITH PASSWORD '${DB_PASSWORD}';\""
su - postgres -c "psql -c \"ALTER ROLE lbank SET client_encoding TO 'utf8';\""
su - postgres -c "psql -c \"ALTER ROLE lbank SET default_transaction_isolation TO 'read committed';\""
su - postgres -c "psql -c \"ALTER ROLE lbank SET timezone TO 'UTC';\""
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE lbank TO lbank;\""

# Configure backend settings
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

# Configure frontend environment variables
echo -e "${BLUE}Configuring frontend environment variables...${NC}"
cat > /var/www/lbank/frontend/.env << EOL
REACT_APP_API_URL=https://${DOMAIN_NAME}/api
REACT_APP_WS_URL=wss://${DOMAIN_NAME}/ws
REACT_APP_LBANK_API_KEY=${LBANK_API_KEY}
REACT_APP_LBANK_API_SECRET=${LBANK_API_SECRET}
EOL

# Copy configuration files
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

# Configure Supervisor
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

# Build frontend
echo -e "${BLUE}Building frontend...${NC}"
cd /var/www/lbank/frontend
su - lbank -c "cd /var/www/lbank/frontend && npm install && npm run build"

# Run database migrations and create admin user
echo -e "${BLUE}Running database migrations and creating admin user...${NC}"
cd /var/www/lbank/backend
su - lbank -c "source /var/www/lbank/venv/bin/activate && cd /var/www/lbank/backend && python scripts/setup.py"

# Add ENABLE_AI_ANALYSIS to .env file
cat > /var/www/lbank/backend/.env << EOL
ENABLE_AI_ANALYSIS=${ENABLE_AI_ANALYSIS}
OPENAI_API_KEY=${OPENAI_API_KEY}
EOL

# Restart services
echo -e "${BLUE}Restarting services...${NC}"
systemctl restart nginx
systemctl restart supervisor

# Install SSL certificate with Let's Encrypt
echo -e "${BLUE}Installing SSL certificate...${NC}"
certbot --nginx -d ${DOMAIN_NAME} --non-interactive --agree-tos --email admin@${DOMAIN_NAME} --redirect

# Set up automatic SSL renewal
echo -e "${BLUE}Setting up automatic SSL renewal...${NC}"
(crontab -l 2>/dev/null | grep -q "certbot renew") || (crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet") | crontab -

# Display final information
echo -e "${GREEN}Installation completed successfully!${NC}"
echo -e "${GREEN}Your application is now available at:${NC}"
echo -e "https://${DOMAIN_NAME}"
echo -e "\nAdmin user credentials:"
echo -e "Username: admin"
echo -e "Password: admin123"
echo -e "\n${RED}IMPORTANT: Please change the admin password after first login!${NC}"
echo -e "\n${YELLOW}SSL certificate will be automatically renewed every day at midnight.${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Access your admin panel at: https://${DOMAIN_NAME}/admin"
echo -e "2. Change the default admin password"
echo -e "3. Configure your trading settings"
echo -e "4. Set up your trading strategies"
echo -e "5. Monitor your system logs at /var/log/lbank.*.log"

echo -e "\n${RED}Security Reminders:${NC}"
echo -e "1. Keep your API keys secure"
echo -e "2. Regularly update your passwords"
echo -e "3. Monitor system logs for suspicious activities"
echo -e "4. Keep the system updated regularly" 