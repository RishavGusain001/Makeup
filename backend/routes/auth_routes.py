# backend/routes/auth_routes.py

from flask import Blueprint
from controllers.auth_controller import login, change_password
from models.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

auth_bp.route('/login', methods=['POST'])(login)
auth_bp.route('/change-password', methods=['PUT'])(token_required(change_password))
