# backend/routes/booking_routes.py

from flask import Blueprint
from controllers.booking_controller import (
    create_booking, get_all_bookings,
    update_booking_status, delete_booking, get_available_slots
)
from models.auth_middleware import token_required

booking_bp = Blueprint('bookings', __name__)

# Public routes
booking_bp.route('/', methods=['POST'])(create_booking)
booking_bp.route('/available-slots', methods=['GET'])(get_available_slots)

# Admin-protected routes
booking_bp.route('/', methods=['GET'])(token_required(get_all_bookings))
booking_bp.route('/<int:booking_id>/status', methods=['PUT'])(token_required(update_booking_status))
booking_bp.route('/<int:booking_id>', methods=['DELETE'])(token_required(delete_booking))
