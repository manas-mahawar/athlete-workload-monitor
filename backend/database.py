import os

import mysql.connector
from dotenv import load_dotenv

# Read DB_HOST, DB_USER, etc. from backend/.env into environment variables
load_dotenv()

def get_connection():
    """Open a new connection to the existing MySQL database."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )


def fetch_all(sql, params=None):
    """Run a SELECT query and return the rows as a list of dictionaries.

    params fills the %s placeholders in sql. The connector escapes these
    values itself, which is what protects us from SQL injection.
    """
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(sql, params or ())
        return cursor.fetchall()
    finally:
        # Always runs, even if the query fails, so connections never leak
        cursor.close()
        connection.close()
