# backend/manage.py

import bcrypt
import pymysql
import getpass
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def get_db():
    return pymysql.connect(
        host=os.getenv('MYSQL_HOST'),
        user=os.getenv('MYSQL_USER'),
        password=os.getenv('MYSQL_PASSWORD'),
        database=os.getenv('MYSQL_DB'),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

def create_admin():
    print("=== Create Admin User ===")
    username = input("Username: ").strip()
    if not username:
        print("❌ Username cannot be empty"); return

    # getpass hides the password while typing — no plaintext in terminal history
    password = getpass.getpass("Password (min 8 chars): ")
    if len(password) < 8:
        print("❌ Password too short"); return

    confirm = getpass.getpass("Confirm password: ")
    if password != confirm:
        print("❌ Passwords do not match"); return

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')

    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM admin WHERE username = %s", (username,))
    if cursor.fetchone():
        overwrite = input(f"Admin '{username}' already exists. Overwrite? (yes/no): ")
        if overwrite.lower() != 'yes':
            print("Cancelled."); return
        cursor.execute("UPDATE admin SET password=%s WHERE username=%s", (hashed, username))
        print(f"✅ Admin '{username}' updated successfully.")
    else:
        cursor.execute("INSERT INTO admin (username, password) VALUES (%s, %s)", (username, hashed))
        print(f"✅ Admin '{username}' created successfully.")
    db.close()

def list_admins():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, username, created_at FROM admin")
    admins = cursor.fetchall()
    db.close()
    if not admins:
        print("No admin users found.")
        return
    print(f"\n{'ID':<5} {'Username':<20} {'Created'}")
    print("-" * 45)
    for a in admins:
        print(f"{a['id']:<5} {a['username']:<20} {a['created_at']}")

def delete_admin():
    list_admins()
    username = input("\nEnter username to delete: ").strip()
    confirm = input(f"Delete admin '{username}'? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Cancelled."); return
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM admin WHERE username=%s", (username,))
    db.close()
    print(f"✅ Admin '{username}' deleted.")

# ── CLI ────────────────────────────────────────────────
commands = {
    'create-admin': create_admin,
    'list-admins':  list_admins,
    'delete-admin': delete_admin,
}

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else None
    if cmd not in commands:
        print("Usage: python manage.py <command>")
        print("Commands:", ', '.join(commands.keys()))
        sys.exit(1)
    commands[cmd]()