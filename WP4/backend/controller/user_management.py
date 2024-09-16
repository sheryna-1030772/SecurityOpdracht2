from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity


@jwt_required()
def home():
    current_user = get_jwt_identity()
    if current_user:
        return jsonify({
            'status': 'logged_in',
            'username': current_user['username']
        })
    else:
        return jsonify({
            'status': 'guest'
        })
