import os
import sys
import subprocess
import django
from django.core.management import execute_from_command_line

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def run_setup():
    print("Starting setup process...")
    
    # Run migrations
    print("\nRunning database migrations...")
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Create admin user
    print("\nCreating admin user...")
    from create_admin import create_admin_user
    create_admin_user()
    
    print("\nSetup completed successfully!")

if __name__ == '__main__':
    run_setup() 