# backend/controllers/auth_controller.py - Authentication Logic

import bcrypt
import jwt
import datetime
from flask import jsonify, request, current_app
from models.db import get_db

def login():
    """Handle admin login and return JWT token."""
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password are required'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM admin WHERE username = %s", (data['username'],))
    admin = cursor.fetchone()

    if not admin:
        return jsonify({'message': 'Invalid credentials'}), 401

    # Verify password with bcrypt
    if not bcrypt.checkpw(data['password'].encode('utf-8'), admin['password'].encode('utf-8')):
        return jsonify({'message': 'Invalid credentials'}), 401

    # Generate JWT token (expires in 24 hours)
    token = jwt.encode({
        'admin_id': admin['id'],
        'username': admin['username'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'username': admin['username']
    }), 200

def change_password(current_user_id):
    """Allow admin to change their password."""
    data = request.get_json()

    if not data or not data.get('old_password') or not data.get('new_password'):
        return jsonify({'message': 'Old and new passwords are required'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM admin WHERE id = %s", (current_user_id,))
    admin = cursor.fetchone()

    if not bcrypt.checkpw(data['old_password'].encode('utf-8'), admin['password'].encode('utf-8')):
        return jsonify({'message': 'Old password is incorrect'}), 401

    hashed = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt())
    cursor.execute("UPDATE admin SET password = %s WHERE id = %s", (hashed.decode('utf-8'), current_user_id))

    return jsonify({'message': 'Password changed successfully'}), 200
