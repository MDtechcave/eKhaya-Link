import os
from mysql.connector import pooling, Error
from dotenv import load_dotenv

load_dotenv()

db_pool = None

try:
    db_pool = pooling.MySQLConnectionPool(
        pool_name="ekhaya_connection_pool",
        pool_size=5,
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    print("MySQL Database connection pool established successfully.")
except Erorr as e:
    print(f" Critical Error setting up MySQL pool")
    db_pool = None

def get_db_connection():
    global db_pool
    if db_pool is None:
        raise Exception("Database connection is offline")
    return db_pool.get_connection()