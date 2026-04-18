# backend/controllers/client_controller.py

import bcrypt
import jwt
import datetime
from flask import jsonify, request, current_app
from models.db import get_db

def register():
    data = request.get_json()
    required = ['name', 'email', 'phone', 'password']
    for f in required:
        if not data.get(f):
            return jsonify({'message': f'{f} is required'}), 400

    if len(data['password']) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT id FROM clients WHERE email = %s", (data['email'],))
    if cursor.fetchone():
        return jsonify({'message': 'An account with this email already exists'}), 409

    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cursor.execute(
        "INSERT INTO clients (name, email, phone, password) VALUES (%s, %s, %s, %s)",
        (data['name'], data['email'], data['phone'], hashed)
    )
    client_id = cursor.lastrowid

    token = _make_token(client_id, data['name'])
    return jsonify({
        'message': 'Account created successfully!',
        'token': token,
        'client': {'id': client_id, 'name': data['name'], 'email': data['email'], 'phone': data['phone']}
    }), 201


def login():
    data = request.get_json()
    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM clients WHERE email = %s", (data['email'],))
    client = cursor.fetchone()

    if not client or not bcrypt.checkpw(data['password'].encode('utf-8'), client['password'].encode('utf-8')):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = _make_token(client['id'], client['name'])
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'client': {'id': client['id'], 'name': client['name'], 'email': client['email'], 'phone': client['phone']}
    }), 200


def get_my_bookings(current_client_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT b.*, s.name as service_name, s.price as service_price
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.client_id = %s
        ORDER BY b.created_at DESC
    """, (current_client_id,))
    bookings = cursor.fetchall()
    for b in bookings:
        b['booking_date'] = str(b['booking_date'])
        b['booking_time'] = str(b['booking_time'])
        b['created_at']   = str(b['created_at'])
    return jsonify({'bookings': bookings}), 200


def get_profile(current_client_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, name, email, phone, created_at FROM clients WHERE id = %s", (current_client_id,))
    client = cursor.fetchone()
    if client:
        client['created_at'] = str(client['created_at'])
    return jsonify({'client': client}), 200


def _make_token(client_id, name):
    return jwt.encode({
        'client_id': client_id,
        'name': name,
        'role': 'client',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')
