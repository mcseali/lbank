import os
import sys
import django
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.db import transaction

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def create_admin_user():
    User = get_user_model()
    
    # Admin user credentials
    admin_data = {
        'username': 'admin',
        'email': 'admin@example.com',
        'password': 'admin123',  # This should be changed after first login
        'is_staff': True,
        'is_superuser': True,
        'is_active': True,
        'role': 'admin',
        'permissions': [
            'view_user',
            'add_user',
            'change_user',
            'delete_user',
            'view_trade',
            'add_trade',
            'change_trade',
            'delete_trade',
            'view_order',
            'add_order',
            'change_order',
            'delete_order',
            'view_portfolio',
            'add_portfolio',
            'change_portfolio',
            'delete_portfolio',
            'view_wallet',
            'add_wallet',
            'change_wallet',
            'delete_wallet',
            'view_transaction',
            'add_transaction',
            'change_transaction',
            'delete_transaction',
            'view_api_key',
            'add_api_key',
            'change_api_key',
            'delete_api_key',
            'view_backtest',
            'add_backtest',
            'change_backtest',
            'delete_backtest',
            'view_strategy',
            'add_strategy',
            'change_strategy',
            'delete_strategy',
            'view_alert',
            'add_alert',
            'change_alert',
            'delete_alert',
            'view_notification',
            'add_notification',
            'change_notification',
            'delete_notification',
            'view_settings',
            'add_settings',
            'change_settings',
            'delete_settings',
        ]
    }

    try:
        with transaction.atomic():
            # Create admin user
            admin_user = User.objects.create_user(
                username=admin_data['username'],
                email=admin_data['email'],
                password=admin_data['password'],
                is_staff=admin_data['is_staff'],
                is_superuser=admin_data['is_superuser'],
                is_active=admin_data['is_active'],
                role=admin_data['role']
            )

            # Assign all permissions
            for permission in admin_data['permissions']:
                try:
                    perm = Permission.objects.get(codename=permission)
                    admin_user.user_permissions.add(perm)
                except Permission.DoesNotExist:
                    print(f"Warning: Permission {permission} not found")

            print("Admin user created successfully!")
            print(f"Username: {admin_data['username']}")
            print(f"Email: {admin_data['email']}")
            print(f"Password: {admin_data['password']}")
            print("\nPlease change the password after first login!")

    except Exception as e:
        print(f"Error creating admin user: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    create_admin_user() 