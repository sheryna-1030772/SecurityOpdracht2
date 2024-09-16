from werkzeug.security import generate_password_hash
from .db import get_db_connection


def get_user_by_username(username):
    conn = get_db_connection()
    try:
        user = conn.execute("SELECT id, username, password FROM Users WHERE username = ?", (username,)).fetchone()
        return user
    finally:
        conn.close()


# This is for adding new students for now, so that's why it gets role 2.
def add_user(username, password, firstname, infix, lastname, domain, role_id=2):
    conn = get_db_connection()
    hashed_password = generate_password_hash(password)
    conn.execute("""
        INSERT INTO Users (username, password, firstname, infix, lastname, role_id, domain_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (username, hashed_password, firstname, infix, lastname, role_id, domain))
    conn.commit()
    conn.close()