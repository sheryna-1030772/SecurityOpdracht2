from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from user import get_user_by_username, add_user


def login():
    username = request.json.get('username')
    password = request.json.get('password')
    domain = request.json.get('domain_id')
    user = get_user_by_username(username)
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity={'username': user['username'], 'user_id': user['id']})
        return jsonify(access_token=access_token, success=True, message="Inloggen succesvol")
    else:
        return jsonify(success=False, message="Onjuiste gebruikersnaam of wachtwoord"), 401


def logout():
    return jsonify(message="Uitloggen succesvol")


def register():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        firstname = data.get('firstname')
        lastname = data.get('lastname')
        infix = data.get('infix', '')
        domain = data.get('domain')

        if not all([email, password, firstname, lastname, domain]):
            return jsonify({"error": "Alle velden behalve tussenvoegsel zijn verplicht"}), 400

        if not email.endswith('@hr.nl'):
            return jsonify({"error": "Email moet een HR.nl adres zijn"}), 400

        username = email.split('@')[0]

        if get_user_by_username(username) is not None:
            return jsonify({"error": "E-mailadres is al in gebruik"}), 409

        try:
            add_user(username, password, firstname, infix, lastname, domain)
            return jsonify({"success": "Registratie gelukt!"}), 201
        except Exception as e:
            return jsonify({"error": "Registratie mislukt: " + str(e)}), 500

    return jsonify({"error": "Ongeldig verzoek"}), 405
