# backend/routes/client_routes.py

from flask import Blueprint
from controllers.client_controller import register, login, get_my_bookings, get_profile
from models.client_middleware import client_token_required

client_bp = Blueprint('client', __name__)

client_bp.route('/register', methods=['POST'])(register)
client_bp.route('/login',    methods=['POST'])(login)
client_bp.route('/profile',  methods=['GET'])(client_token_required(get_profile))
client_bp.route('/my-bookings', methods=['GET'])(client_token_required(get_my_bookings))
