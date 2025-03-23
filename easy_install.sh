#!/bin/bash

# Colors for better display
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default values
DEFAULT_DB_PASSWORD=$(openssl rand -base64 12)
DEFAULT_SECRET_KEY=$(openssl rand -base64 32)
DEFAULT_EMAIL_HOST="smtp.gmail.com"
DEFAULT_EMAIL_PORT="587"
DEFAULT_DOMAIN="localhost"

clear
echo -e "${BLUE}=== LBank Trading Bot - Easy Installation ===${NC}"
echo -e "${YELLOW}This script will help you install and configure the LBank Trading Bot.${NC}\n"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Please run this script as root (use sudo)${NC}" 
   exit 1
fi

# Function to show spinner while processing
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Function to check system requirements
check_requirements() {
    echo -e "\n${BLUE}Checking system requirements...${NC}"
    
    # Check CPU
    CPU_CORES=$(nproc)
    if [ $CPU_CORES -lt 2 ]; then
        echo -e "${RED}Warning: Your system has less than 2 CPU cores${NC}"
    fi
    
    # Check RAM
    TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
    if [ $TOTAL_RAM -lt 2048 ]; then
        echo -e "${RED}Warning: Your system has less than 2GB RAM${NC}"
    fi
    
    # Check Disk Space
    FREE_SPACE=$(df -m / | awk 'NR==2 {print $4}')
    if [ $FREE_SPACE -lt 5120 ]; then
        echo -e "${RED}Warning: You need at least 5GB of free disk space${NC}"
    fi
}

# Function to install dependencies
install_dependencies() {
    echo -e "\n${BLUE}Installing required packages...${NC}"
    apt update &> /dev/null & spinner $!
    apt install -y python3 python3-pip python3-venv nginx postgresql redis-server supervisor git certbot python3-certbot-nginx curl &> /dev/null & spinner $!
    
    echo -e "\n${BLUE}Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - &> /dev/null & spinner $!
    apt install -y nodejs &> /dev/null & spinner $!
}

# Main installation menu
main_menu() {
    while true; do
        clear
        echo -e "${BLUE}=== LBank Trading Bot - Installation Menu ===${NC}"
        echo -e "1) Quick Install (with default settings)"
        echo -e "2) Custom Install (configure all settings)"
        echo -e "3) Check System Requirements"
        echo -e "4) Exit"
        read -p "Select an option [1-4]: " choice

        case $choice in
            1)
                quick_install
                break
                ;;
            2)
                custom_install
                break
                ;;
            3)
                check_requirements
                read -p "Press Enter to continue..."
                ;;
            4)
                echo -e "${YELLOW}Installation cancelled.${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                ;;
        esac
    done
}

# Quick install with default settings
quick_install() {
    echo -e "\n${BLUE}Starting quick installation with default settings...${NC}"
    
    # Use default values
    DB_PASSWORD=$DEFAULT_DB_PASSWORD
    DJANGO_SECRET_KEY=$DEFAULT_SECRET_KEY
    DOMAIN_NAME=$DEFAULT_DOMAIN
    
    # Install dependencies
    install_dependencies
    
    # Setup database
    setup_database
    
    # Configure application
    configure_application
    
    # Final setup
    finish_installation
}

# Custom installation with user input
custom_install() {
    echo -e "\n${BLUE}Starting custom installation...${NC}"
    
    # Domain settings
    echo -e "\n${YELLOW}=== Domain Settings ===${NC}"
    read -p "Enter your domain name [default: $DEFAULT_DOMAIN]: " DOMAIN_NAME
    DOMAIN_NAME=${DOMAIN_NAME:-$DEFAULT_DOMAIN}
    
    # Database settings
    echo -e "\n${YELLOW}=== Database Settings ===${NC}"
    read -p "Enter database password [default: random]: " DB_PASSWORD
    DB_PASSWORD=${DB_PASSWORD:-$DEFAULT_DB_PASSWORD}
    
    # LBank API settings
    echo -e "\n${YELLOW}=== LBank API Settings ===${NC}"
    echo "You can get these from: https://www.lbank.com/en-US/user/api/"
    read -p "Enter LBank API Key: " LBANK_API_KEY
    read -p "Enter LBank API Secret: " LBANK_API_SECRET
    
    # Email settings
    echo -e "\n${YELLOW}=== Email Settings ===${NC}"
    read -p "Enter email host [default: $DEFAULT_EMAIL_HOST]: " EMAIL_HOST
    EMAIL_HOST=${EMAIL_HOST:-$DEFAULT_EMAIL_HOST}
    read -p "Enter email port [default: $DEFAULT_EMAIL_PORT]: " EMAIL_PORT
    EMAIL_PORT=${EMAIL_PORT:-$DEFAULT_EMAIL_PORT}
    read -p "Enter email username: " EMAIL_USERNAME
    read -p "Enter email password: " EMAIL_PASSWORD
    read -p "Enter sender email address: " EMAIL_FROM
    
    # Install dependencies
    install_dependencies
    
    # Setup database
    setup_database
    
    # Configure application
    configure_application
    
    # Final setup
    finish_installation
}

# Setup database
setup_database() {
    echo -e "\n${BLUE}Setting up database...${NC}"
    su - postgres -c "psql -c \"CREATE DATABASE lbank;\"" &> /dev/null
    su - postgres -c "psql -c \"CREATE USER lbank WITH PASSWORD '$DB_PASSWORD';\"" &> /dev/null
    su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE lbank TO lbank;\"" &> /dev/null
}

# Configure application
configure_application() {
    echo -e "\n${BLUE}Configuring application...${NC}"
    
    # Create application directory
    mkdir -p /var/www/lbank
    cd /var/www/lbank
    
    # Clone repository
    git clone https://github.com/7766112092/lbank.git . &> /dev/null & spinner $!
    
    # Setup virtual environment
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt &> /dev/null & spinner $!
    
    # Create configuration files
    create_config_files
    
    # Build frontend
    cd frontend
    npm install &> /dev/null & spinner $!
    npm run build &> /dev/null & spinner $!
}

# Create configuration files
create_config_files() {
    # Create .env file
    cat > .env << EOL
DB_PASSWORD=$DB_PASSWORD
SECRET_KEY=$DJANGO_SECRET_KEY
DOMAIN_NAME=$DOMAIN_NAME
LBANK_API_KEY=$LBANK_API_KEY
LBANK_API_SECRET=$LBANK_API_SECRET
EMAIL_HOST=$EMAIL_HOST
EMAIL_PORT=$EMAIL_PORT
EMAIL_USERNAME=$EMAIL_USERNAME
EMAIL_PASSWORD=$EMAIL_PASSWORD
EMAIL_FROM=$EMAIL_FROM
EOL
}

# Final installation steps
finish_installation() {
    echo -e "\n${BLUE}Finalizing installation...${NC}"
    
    # Setup SSL if domain is not localhost
    if [ "$DOMAIN_NAME" != "localhost" ]; then
        certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME --redirect &> /dev/null & spinner $!
    fi
    
    # Restart services
    systemctl restart nginx
    systemctl restart supervisor
    
    # Show completion message
    echo -e "\n${GREEN}Installation completed successfully!${NC}"
    echo -e "\nYour application is available at:"
    if [ "$DOMAIN_NAME" == "localhost" ]; then
        echo -e "http://localhost"
    else
        echo -e "https://$DOMAIN_NAME"
    fi
    
    echo -e "\n${YELLOW}Default admin credentials:${NC}"
    echo -e "Username: admin"
    echo -e "Password: admin123"
    echo -e "\n${RED}IMPORTANT: Please change the admin password after first login!${NC}"
    
    # Save credentials to file
    echo -e "\n${BLUE}Saving credentials to /root/lbank_credentials.txt${NC}"
    cat > /root/lbank_credentials.txt << EOL
LBank Trading Bot Credentials
============================
Domain: $DOMAIN_NAME
Database Password: $DB_PASSWORD
Admin Username: admin
Admin Password: admin123
Email Host: $EMAIL_HOST
Email Username: $EMAIL_USERNAME
LBank API Key: $LBANK_API_KEY
EOL
    chmod 600 /root/lbank_credentials.txt
}

# Start installation
main_menu 