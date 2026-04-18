# backend/controllers/booking_controller.py - Booking Business Logic (v2 with client support)

from flask import jsonify, request
from models.db import get_db

def create_booking():
    """Create a new booking. If client JWT present, link to client account."""
    data = request.get_json()

    required = ['name', 'phone', 'service_id', 'booking_date', 'booking_time']
    for field in required:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    # Optionally extract client_id from token if sent
    client_id = data.get('client_id', None)

    db = get_db()
    cursor = db.cursor()

    # Check double booking
    cursor.execute(
        "SELECT id FROM bookings WHERE booking_date=%s AND booking_time=%s AND status!='rejected'",
        (data['booking_date'], data['booking_time'])
    )
    if cursor.fetchone():
        return jsonify({'message': 'This time slot is already booked. Please choose another time.'}), 409

    cursor.execute("SELECT id FROM services WHERE id=%s", (data['service_id'],))
    if not cursor.fetchone():
        return jsonify({'message': 'Selected service does not exist'}), 404

    cursor.execute(
        """INSERT INTO bookings (client_id, name, phone, address, service_id, booking_date, booking_time, notes)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (
            client_id,
            data['name'],
            data['phone'],
            data.get('address', ''),
            data['service_id'],
            data['booking_date'],
            data['booking_time'] + ':00' if len(data['booking_time']) == 5 else data['booking_time'],
            data.get('notes', '')
        )
    )

    return jsonify({
        'message': 'Booking created successfully! We will contact you shortly.',
        'booking_id': cursor.lastrowid
    }), 201


def get_all_bookings(current_user_id):
    """Admin: get all bookings with optional filters."""
    db = get_db()
    cursor = db.cursor()

    status_filter = request.args.get('status')
    date_filter   = request.args.get('date')
    search        = request.args.get('search', '').strip()

    query = """
        SELECT b.*, s.name as service_name, s.price as service_price,
               c.email as client_email
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        LEFT JOIN clients c ON b.client_id = c.id
        WHERE 1=1
    """
    params = []

    if status_filter:
        query += " AND b.status = %s"
        params.append(status_filter)
    if date_filter:
        query += " AND b.booking_date = %s"
        params.append(date_filter)
    if search:
        query += " AND (b.name LIKE %s OR b.phone LIKE %s OR c.email LIKE %s)"
        like = f'%{search}%'
        params += [like, like, like]

    query += " ORDER BY b.created_at DESC"
    cursor.execute(query, params)
    bookings = cursor.fetchall()

    for b in bookings:
        b['booking_date'] = str(b['booking_date'])
        b['booking_time'] = str(b['booking_time'])
        b['created_at']   = str(b['created_at'])

    return jsonify({'bookings': bookings}), 200


def get_dashboard_stats(current_user_id):
    """Admin: aggregated stats for dashboard."""
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM bookings")
    total = cursor.fetchone()['total']

    cursor.execute("SELECT status, COUNT(*) as cnt FROM bookings GROUP BY status")
    by_status = {row['status']: row['cnt'] for row in cursor.fetchall()}

    cursor.execute("SELECT COUNT(*) as cnt FROM bookings WHERE booking_date = CURDATE()")
    today_count = cursor.fetchone()['cnt']

    cursor.execute("SELECT COUNT(*) as cnt FROM clients")
    total_clients = cursor.fetchone()['cnt']

    cursor.execute("""
        SELECT SUM(s.price) as revenue
        FROM bookings b JOIN services s ON b.service_id = s.id
        WHERE b.status = 'completed'
    """)
    revenue = cursor.fetchone()['revenue'] or 0

    cursor.execute("""
        SELECT b.*, s.name as service_name
        FROM bookings b JOIN services s ON b.service_id = s.id
        WHERE b.booking_date = CURDATE()
        ORDER BY b.booking_time ASC
    """)
    today_bookings = cursor.fetchall()
    for b in today_bookings:
        b['booking_date'] = str(b['booking_date'])
        b['booking_time'] = str(b['booking_time'])
        b['created_at']   = str(b['created_at'])

    # Monthly bookings (last 6 months)
    cursor.execute("""
        SELECT DATE_FORMAT(booking_date,'%Y-%m') as month, COUNT(*) as cnt
        FROM bookings
        WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY month ORDER BY month ASC
    """)
    monthly = cursor.fetchall()

    # Top services
    cursor.execute("""
        SELECT s.name, COUNT(b.id) as bookings_count
        FROM bookings b JOIN services s ON b.service_id = s.id
        GROUP BY s.id ORDER BY bookings_count DESC LIMIT 5
    """)
    top_services = cursor.fetchall()

    return jsonify({
        'total_bookings': total,
        'by_status': by_status,
        'today_count': today_count,
        'total_clients': total_clients,
        'revenue': float(revenue),
        'today_bookings': today_bookings,
        'monthly': monthly,
        'top_services': top_services,
    }), 200


def update_booking_status(current_user_id, booking_id):
    data = request.get_json()
    new_status = data.get('status')
    valid = ['pending', 'accepted', 'rejected', 'completed']
    if new_status not in valid:
        return jsonify({'message': f'Status must be one of: {", ".join(valid)}'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM bookings WHERE id=%s", (booking_id,))
    if not cursor.fetchone():
        return jsonify({'message': 'Booking not found'}), 404

    cursor.execute("UPDATE bookings SET status=%s WHERE id=%s", (new_status, booking_id))
    return jsonify({'message': f'Booking updated to {new_status}'}), 200


def delete_booking(current_user_id, booking_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM bookings WHERE id=%s", (booking_id,))
    if not cursor.fetchone():
        return jsonify({'message': 'Booking not found'}), 404
    cursor.execute("DELETE FROM bookings WHERE id=%s", (booking_id,))
    return jsonify({'message': 'Booking deleted'}), 200


def get_available_slots():
    date = request.args.get('date')
    if not date:
        return jsonify({'message': 'Date is required'}), 400
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "SELECT booking_time FROM bookings WHERE booking_date=%s AND status!='rejected'", (date,)
    )
    times = [str(r['booking_time'])[:5] for r in cursor.fetchall()]
    return jsonify({'booked_times': times}), 200


def get_all_clients(current_user_id):
    """Admin: list all registered clients with booking count."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT c.id, c.name, c.email, c.phone, c.created_at,
               COUNT(b.id) as total_bookings
        FROM clients c
        LEFT JOIN bookings b ON b.client_id = c.id
        GROUP BY c.id
        ORDER BY c.created_at DESC
    """)
    clients = cursor.fetchall()
    for c in clients:
        c['created_at'] = str(c['created_at'])
    return jsonify({'clients': clients}), 200
