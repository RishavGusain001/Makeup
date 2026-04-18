# backend/routes/booking_routes.py

from flask import Blueprint
from controllers.booking_controller import (
    create_booking, get_all_bookings, update_booking_status,
    delete_booking, get_available_slots, get_dashboard_stats, get_all_clients
)
from models.auth_middleware import token_required

booking_bp = Blueprint('bookings', __name__)

booking_bp.route('/', methods=['POST'])(create_booking)
booking_bp.route('/available-slots', methods=['GET'])(get_available_slots)
booking_bp.route('/', methods=['GET'])(token_required(get_all_bookings))
booking_bp.route('/stats', methods=['GET'])(token_required(get_dashboard_stats))
booking_bp.route('/clients', methods=['GET'])(token_required(get_all_clients))
booking_bp.route('/<int:booking_id>/status', methods=['PUT'])(token_required(update_booking_status))
booking_bp.route('/<int:booking_id>', methods=['DELETE'])(token_required(delete_booking))
