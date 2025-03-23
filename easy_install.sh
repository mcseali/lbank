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

# Function to install Docker and dependencies
install_docker() {
    echo -e "\n${BLUE}Installing Docker and dependencies...${NC}"
    
    # Update package list
    echo -e "${YELLOW}Updating package list...${NC}"
    apt update &> /dev/null & spinner $!
    
    # Install required packages
    echo -e "${YELLOW}Installing required packages...${NC}"
    apt install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release &> /dev/null & spinner $!
    
    # Add Docker's official GPG key
    echo -e "${YELLOW}Adding Docker's GPG key...${NC}"
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up the stable repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    echo -e "${YELLOW}Installing Docker Engine...${NC}"
    apt update &> /dev/null & spinner $!
    apt install -y docker-ce docker-ce-cli containerd.io &> /dev/null & spinner $!
    
    # Install Docker Compose
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    apt install -y docker-compose &> /dev/null & spinner $!
    
    # Start and enable Docker service
    echo -e "${YELLOW}Starting Docker service...${NC}"
    systemctl start docker
    systemctl enable docker
    
    # Add current user to docker group
    echo -e "${YELLOW}Adding user to docker group...${NC}"
    usermod -aG docker $SUDO_USER
    
    # Verify installations
    echo -e "${GREEN}Docker version:${NC}"
    docker --version
    echo -e "${GREEN}Docker Compose version:${NC}"
    docker-compose --version
}

# Function to install dependencies
install_dependencies() {
    echo -e "\n${BLUE}Installing system dependencies...${NC}"
    apt install -y python3 python3-pip python3-venv nginx postgresql redis-server supervisor git certbot python3-certbot-nginx curl &> /dev/null & spinner $!
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
                install_quick
                break
                ;;
            2)
                install_custom
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
install_quick() {
    echo -e "\n${BLUE}Starting quick installation with default settings...${NC}"
    
    # Check requirements
    check_requirements
    
    # Install Docker and dependencies
    install_docker
    
    # Use default values
    DB_PASSWORD=$DEFAULT_DB_PASSWORD
    DJANGO_SECRET_KEY=$DEFAULT_SECRET_KEY
    DOMAIN_NAME=$DEFAULT_DOMAIN
    
    # Clone repository
    echo -e "\n${BLUE}Cloning repository...${NC}"
    git clone https://github.com/7766112092/lbank.git /tmp/lbank &> /dev/null & spinner $!
    
    # Copy files to installation directory
    echo -e "${YELLOW}Copying files...${NC}"
    mkdir -p /var/www/lbank
    cp -r /tmp/lbank/* /var/www/lbank/
    
    # Start containers
    echo -e "${YELLOW}Starting Docker containers...${NC}"
    cd /var/www/lbank
    docker-compose up --build -d
    
    # Final setup
    finish_installation
}

# Custom installation with user input
install_custom() {
    echo -e "\n${BLUE}Starting custom installation...${NC}"
    
    # Check requirements
    check_requirements
    
    # Install Docker and dependencies
    install_docker
    
    # Get user input for settings
    echo -e "\n${YELLOW}=== Configuration Settings ===${NC}"
    
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
    
    # Clone repository
    echo -e "\n${BLUE}Cloning repository...${NC}"
    git clone https://github.com/7766112092/lbank.git /tmp/lbank &> /dev/null & spinner $!
    
    # Copy files to installation directory
    echo -e "${YELLOW}Copying files...${NC}"
    mkdir -p /var/www/lbank
    cp -r /tmp/lbank/* /var/www/lbank/
    
    # Create configuration files
    create_config_files
    
    # Start containers
    echo -e "${YELLOW}Starting Docker containers...${NC}"
    cd /var/www/lbank
    docker-compose up --build -d
    
    # Final setup
    finish_installation
}

# Create configuration files
create_config_files() {
    echo -e "\n${BLUE}Creating configuration files...${NC}"
    
    # Create .env file
    cat > /var/www/lbank/.env << EOL
DB_PASSWORD=$DB_PASSWORD
DOMAIN_NAME=$DOMAIN_NAME
LBANK_API_KEY=$LBANK_API_KEY
LBANK_API_SECRET=$LBANK_API_SECRET
EOL
}

# Final installation steps
finish_installation() {
    echo -e "\n${BLUE}Finalizing installation...${NC}"
    
    # Wait for containers to be ready
    echo -e "${YELLOW}Waiting for containers to be ready...${NC}"
    sleep 10
    
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
LBank API Key: $LBANK_API_KEY
EOL
    chmod 600 /root/lbank_credentials.txt
    
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo -e "1. If you haven't already, please log out and log back in for Docker permissions to take effect"
    echo -e "2. Access your application at http://$DOMAIN_NAME"
    echo -e "3. Change the default admin password"
    echo -e "4. Configure your trading settings"
    echo -e "5. Monitor your logs with: docker-compose logs -f"
    
    echo -e "\n${YELLOW}Troubleshooting:${NC}"
    echo -e "1. If you can't access the application, check container status: docker-compose ps"
    echo -e "2. View container logs: docker-compose logs -f [service_name]"
    echo -e "3. Restart containers: docker-compose restart"
    echo -e "4. For more help, visit: https://github.com/7766112092/lbank/issues"
}

# Start installation
main_menu 