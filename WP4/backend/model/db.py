import sqlite3


def get_db_connection():
    connection = sqlite3.connect('./db-presentation.sqlite3')
    connection.row_factory = sqlite3.Row
    return connection