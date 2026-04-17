# backend/controllers/service_controller.py - Services CRUD

from flask import jsonify, request
from models.db import get_db

def get_all_services():
    """Get all services (public)."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM services ORDER BY price ASC")
    services = cursor.fetchall()
    return jsonify({'services': services}), 200

def get_service(service_id):
    """Get a single service by ID (public)."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM services WHERE id = %s", (service_id,))
    service = cursor.fetchone()
    if not service:
        return jsonify({'message': 'Service not found'}), 404
    return jsonify({'service': service}), 200

def create_service(current_user_id):
    """Create a new service (admin only)."""
    data = request.get_json()

    if not data.get('name') or not data.get('price'):
        return jsonify({'message': 'Name and price are required'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO services (name, price, description, duration) VALUES (%s, %s, %s, %s)",
        (data['name'], data['price'], data.get('description', ''), data.get('duration', ''))
    )

    return jsonify({'message': 'Service created successfully', 'id': cursor.lastrowid}), 201

def update_service(current_user_id, service_id):
    """Update an existing service (admin only)."""
    data = request.get_json()

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT id FROM services WHERE id = %s", (service_id,))
    if not cursor.fetchone():
        return jsonify({'message': 'Service not found'}), 404

    cursor.execute(
        """UPDATE services SET name = %s, price = %s, description = %s, duration = %s
           WHERE id = %s""",
        (
            data.get('name'),
            data.get('price'),
            data.get('description', ''),
            data.get('duration', ''),
            service_id
        )
    )

    return jsonify({'message': 'Service updated successfully'}), 200

def delete_service(current_user_id, service_id):
    """Delete a service (admin only)."""
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT id FROM services WHERE id = %s", (service_id,))
    if not cursor.fetchone():
        return jsonify({'message': 'Service not found'}), 404

    cursor.execute("DELETE FROM services WHERE id = %s", (service_id,))
    return jsonify({'message': 'Service deleted successfully'}), 200
