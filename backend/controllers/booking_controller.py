# backend/controllers/booking_controller.py - Booking Business Logic

from flask import jsonify, request
from models.db import get_db

def create_booking():
    """Create a new booking after validating no double booking."""
    data = request.get_json()

    # Validate required fields
    required = ['name', 'phone', 'service_id', 'booking_date', 'booking_time']
    for field in required:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    db = get_db()
    cursor = db.cursor()

    # Check for double booking (same date and time)
    cursor.execute(
        "SELECT id FROM bookings WHERE booking_date = %s AND booking_time = %s AND status != 'rejected'",
        (data['booking_date'], data['booking_time'])
    )
    existing = cursor.fetchone()
    if existing:
        return jsonify({'message': 'This time slot is already booked. Please choose another time.'}), 409

    # Verify service exists
    cursor.execute("SELECT id FROM services WHERE id = %s", (data['service_id'],))
    if not cursor.fetchone():
        return jsonify({'message': 'Selected service does not exist'}), 404

    # Insert new booking
    cursor.execute(
        """INSERT INTO bookings (name, phone, address, service_id, booking_date, booking_time, notes)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (
            data['name'],
            data['phone'],
            data.get('address', ''),
            data['service_id'],
            data['booking_date'],
            data['booking_time'],
            data.get('notes', '')
        )
    )

    return jsonify({
        'message': 'Booking created successfully! We will confirm your appointment soon.',
        'booking_id': cursor.lastrowid
    }), 201

def get_all_bookings(current_user_id):
    """Get all bookings with service details (admin only)."""
    db = get_db()
    cursor = db.cursor()

    status_filter = request.args.get('status')

    query = """
        SELECT b.*, s.name as service_name, s.price as service_price
        FROM bookings b
        JOIN services s ON b.service_id = s.id
    """
    params = []

    if status_filter:
        query += " WHERE b.status = %s"
        params.append(status_filter)

    query += " ORDER BY b.created_at DESC"

    cursor.execute(query, params)
    bookings = cursor.fetchall()

    # Convert date/time objects to strings
    for booking in bookings:
        if booking.get('booking_date'):
            booking['booking_date'] = str(booking['booking_date'])
        if booking.get('booking_time'):
            booking['booking_time'] = str(booking['booking_time'])
        if booking.get('created_at'):
            booking['created_at'] = str(booking['created_at'])

    return jsonify({'bookings': bookings}), 200

def update_booking_status(current_user_id, booking_id):
    """Update booking status: accepted, rejected, completed (admin only)."""
    data = request.get_json()
    new_status = data.get('status')

    valid_statuses = ['pending', 'accepted', 'rejected', 'completed']
    if new_status not in valid_statuses:
        return jsonify({'message': f'Status must be one of: {", ".join(valid_statuses)}'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT id FROM bookings WHERE id = %s", (booking_id,))
    if not cursor.fetchone():
        return jsonify({'message': 'Booking not found'}), 404

    cursor.execute("UPDATE bookings SET status = %s WHERE id = %s", (new_status, booking_id))

    return jsonify({'message': f'Booking status updated to {new_status}'}), 200

def delete_booking(current_user_id, booking_id):
    """Delete a booking (admin only)."""
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT id FROM bookings WHERE id = %s", (booking_id,))
    if not cursor.fetchone():
        return jsonify({'message': 'Booking not found'}), 404

    cursor.execute("DELETE FROM bookings WHERE id = %s", (booking_id,))
    return jsonify({'message': 'Booking deleted successfully'}), 200

def get_available_slots():
    """Return booked time slots for a given date so frontend can disable them."""
    date = request.args.get('date')
    if not date:
        return jsonify({'message': 'Date is required'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT booking_time FROM bookings WHERE booking_date = %s AND status != 'rejected'",
        (date,)
    )
    booked = cursor.fetchall()
    booked_times = [str(row['booking_time']) for row in booked]

    return jsonify({'booked_times': booked_times}), 200
