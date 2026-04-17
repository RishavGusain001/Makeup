# backend/routes/service_routes.py

from flask import Blueprint
from controllers.service_controller import (
    get_all_services, get_service,
    create_service, update_service, delete_service
)
from models.auth_middleware import token_required

service_bp = Blueprint('services', __name__)

# Public routes
service_bp.route('/', methods=['GET'])(get_all_services)
service_bp.route('/<int:service_id>', methods=['GET'])(get_service)

# Admin-protected routes
service_bp.route('/', methods=['POST'])(token_required(create_service))
service_bp.route('/<int:service_id>', methods=['PUT'])(token_required(update_service))
service_bp.route('/<int:service_id>', methods=['DELETE'])(token_required(delete_service))
