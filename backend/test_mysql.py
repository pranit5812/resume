import pymysql
from pymysql.cursors import DictCursor

# Test MySQL connection
try:
    conn = pymysql.connect(
        host="sql12.freesqldatabase.com",
        port=3306,
        user="sql12826746",
        password="Ug1EICLApm",
        database="sql12826746",
        cursorclass=DictCursor
    )
    print("MySQL connection successful!")

    # Test creating a table
    with conn.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("Existing tables:", tables)

    conn.close()
    print("Connection closed successfully")

except Exception as e:
    print(f"MySQL connection failed: {e}")