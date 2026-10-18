import psycopg2
from psycopg2.extras import RealDictCursor

connection_string = "postgresql://postgres:Pranitp5812@db.icabrsjxrqphdmwenkqr.supabase.co:5432/postgres?sslmode=require"

try:
    with psycopg2.connect(connection_string, cursor_factory=RealDictCursor) as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public';")
            tables = cursor.fetchall()
            print("Connected to Supabase Postgres successfully.")
            print("Public tables:", tables)
except Exception as e:
    print(f"Supabase connection failed: {e}")
