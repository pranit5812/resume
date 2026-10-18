import asyncio
import sqlite3
from core.config import settings

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False


class Database:
    conn = None
    is_sqlite = False


db_instance = Database()


def _dict_factory(cursor, row):
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}


def _initialize_db(conn, is_sqlite=False):
    cursor = conn.cursor()
    if is_sqlite:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS resumes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT NOT NULL,
                filename TEXT NOT NULL,
                parsed_text TEXT NOT NULL,
                skills TEXT NOT NULL,
                uploaded_at TEXT NOT NULL
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS interview_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT NOT NULL,
                role TEXT NOT NULL,
                questions TEXT NOT NULL,
                status TEXT NOT NULL,
                answers TEXT,
                results TEXT,
                created_at TEXT NOT NULL,
                completed_at TEXT
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS ats_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT NOT NULL,
                resume_id INTEGER NOT NULL,
                job_description TEXT NOT NULL,
                similarity_score REAL NOT NULL,
                matched_keywords TEXT NOT NULL,
                missing_keywords TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        try:
            cursor.execute("ALTER TABLE ats_reports ADD COLUMN insights TEXT;")
        except Exception:
            pass

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT NOT NULL UNIQUE,
                full_name TEXT,
                education TEXT,
                experience_years INTEGER,
                skills TEXT,
                hobbies TEXT,
                passions TEXT,
                career_goals TEXT,
                suggested_career_paths TEXT,
                updated_at TEXT NOT NULL
            );
            """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                created_at TIMESTAMP NOT NULL
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS resumes (
                id SERIAL PRIMARY KEY,
                user_email VARCHAR(255) NOT NULL,
                filename VARCHAR(255) NOT NULL,
                parsed_text TEXT NOT NULL,
                skills TEXT NOT NULL,
                uploaded_at TIMESTAMP NOT NULL
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS interview_results (
                id SERIAL PRIMARY KEY,
                user_email VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                questions TEXT NOT NULL,
                status VARCHAR(50) NOT NULL,
                answers TEXT,
                results TEXT,
                created_at TIMESTAMP NOT NULL,
                completed_at TIMESTAMP
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS ats_reports (
                id SERIAL PRIMARY KEY,
                user_email VARCHAR(255) NOT NULL,
                resume_id INT NOT NULL,
                job_description TEXT NOT NULL,
                similarity_score FLOAT NOT NULL,
                matched_keywords TEXT NOT NULL,
                missing_keywords TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL
            );
            """
        )
        cursor.execute("ALTER TABLE ats_reports ADD COLUMN IF NOT EXISTS insights TEXT;")
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS profiles (
                id SERIAL PRIMARY KEY,
                user_email VARCHAR(255) NOT NULL UNIQUE,
                full_name VARCHAR(255),
                education VARCHAR(255),
                experience_years INT,
                skills TEXT,
                hobbies TEXT,
                passions TEXT,
                career_goals TEXT,
                suggested_career_paths TEXT,
                updated_at TIMESTAMP NOT NULL
            );
            """
        )
    conn.commit()


async def connect_to_db():
    def _open():
        if settings.DATABASE_URL and settings.DATABASE_URL.startswith("postgres") and PSYCOPG2_AVAILABLE:
            try:
                conn = psycopg2.connect(settings.DATABASE_URL, cursor_factory=RealDictCursor)
                _initialize_db(conn, is_sqlite=False)
                db_instance.is_sqlite = False
                print("Connected to PostgreSQL database successfully.")
                return conn
            except Exception as e:
                print(f"PostgreSQL connection failed: {e}. Falling back to local SQLite database ({settings.DATABASE_FILE}).")

        conn = sqlite3.connect(settings.DATABASE_FILE, check_same_thread=False)
        conn.row_factory = _dict_factory
        _initialize_db(conn, is_sqlite=True)
        db_instance.is_sqlite = True
        print(f"Connected to SQLite database: {settings.DATABASE_FILE}")
        return conn

    db_instance.conn = await asyncio.to_thread(_open)


async def close_db_connection():
    if db_instance.conn:
        await asyncio.to_thread(db_instance.conn.close)


async def get_db():
    if not db_instance.conn:
        await connect_to_db()
    return db_instance.conn


def _prepare_sql(query: str) -> str:
    if db_instance.is_sqlite:
        return query.replace("%s", "?")
    return query


async def query_one(query: str, params: tuple = ()):
    if not db_instance.conn:
        await connect_to_db()

    sql = _prepare_sql(query)
    def _inner():
        cursor = db_instance.conn.cursor()
        cursor.execute(sql, params)
        res = cursor.fetchone()
        cursor.close()
        return res
    return await asyncio.to_thread(_inner)


async def query_all(query: str, params: tuple = ()):
    if not db_instance.conn:
        await connect_to_db()

    sql = _prepare_sql(query)
    def _inner():
        cursor = db_instance.conn.cursor()
        cursor.execute(sql, params)
        res = cursor.fetchall()
        cursor.close()
        return res
    return await asyncio.to_thread(_inner)


async def execute(query: str, params: tuple = ()):
    if not db_instance.conn:
        await connect_to_db()

    sql = _prepare_sql(query)
    def _inner():
        cursor = db_instance.conn.cursor()
        cursor.execute(sql, params)
        db_instance.conn.commit()
        if sql.strip().upper().find("RETURNING") != -1:
            result = cursor.fetchone()
            if result:
                cursor.close()
                if isinstance(result, dict):
                    return list(result.values())[0]
                return result[0]
        last_id = cursor.lastrowid
        cursor.close()
        return last_id
    return await asyncio.to_thread(_inner)

