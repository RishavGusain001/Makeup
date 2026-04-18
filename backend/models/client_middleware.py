# backend/models/client_middleware.py - Client JWT Middleware

import jwt
from functools import wraps
from flask import request, jsonify, current_app

def client_token_required(f):
    """Decorator to protect client routes with JWT token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
        if not token:
            return jsonify({'message': 'Login required'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            if data.get('role') != 'client':
                return jsonify({'message': 'Invalid token type'}), 401
            current_client_id = data['client_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Session expired. Please login again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        return f(current_client_id, *args, **kwargs)
    return decorated
