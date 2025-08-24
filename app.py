import os
import sqlite3
from datetime import datetime

from flask import (
    Flask,
    jsonify,
    redirect,
    render_template,
    request,
    url_for,
)


def create_app() -> Flask:
    app = Flask(
        __name__,
        template_folder="templates",  # updated to match directory name
        static_folder="static",
        instance_relative_config=True,
    )

    # Ensure instance folder exists (for SQLite DB)
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass

    app.config.setdefault("SECRET_KEY", os.environ.get("SECRET_KEY", "dev-secret"))
    app.config.setdefault(
        "DATABASE", os.path.join(app.instance_path, "petcare.db")
    )

    def get_db_connection() -> sqlite3.Connection:
        conn = sqlite3.connect(app.config["DATABASE"], detect_types=sqlite3.PARSE_DECLTYPES)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db() -> None:
        with get_db_connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS appointments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    phone TEXT NOT NULL,
                    email TEXT,
                    pet_type TEXT NOT NULL,
                    service TEXT NOT NULL,
                    date TEXT NOT NULL,
                    time TEXT NOT NULL,
                    message TEXT,
                    status TEXT NOT NULL DEFAULT 'pending',
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    # Initialize database at startup
    with app.app_context():
        init_db()

    @app.get("/")
    def home():
        return render_template("index.html")

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/api/appointments")
    def list_appointments():
        with get_db_connection() as conn:
            rows = conn.execute(
                "SELECT id, name, phone, email, pet_type, service, date, time, message, status, created_at FROM appointments ORDER BY id DESC"
            ).fetchall()
        return jsonify([dict(r) for r in rows])

    @app.post("/api/appointments")
    def create_appointment():
        # Accept JSON or form-encoded data
        payload = request.get_json(silent=True) or request.form.to_dict(flat=True)

        name = (payload.get("name") or "").strip()
        phone = (payload.get("phone") or "").strip()
        email = (payload.get("email") or "").strip()
        pet_type = (payload.get("petType") or payload.get("pet_type") or "").strip()
        service = (payload.get("service") or "").strip()
        date = (payload.get("date") or "").strip()
        time_ = (payload.get("time") or "").strip()
        message = (payload.get("message") or "").strip()

        # Basic validation
        missing = [
            field
            for field, value in {
                "phone": phone,
                "petType": pet_type,
                "service": service,
                "date": date,
                "time": time_,
            }.items()
            if not value
        ]
        if missing:
            return (
                jsonify({
                    "ok": False,
                    "error": "Missing required fields",
                    "missing": missing,
                }),
                400,
            )

        created_at = datetime.utcnow().isoformat()

        with get_db_connection() as conn:
            conn.execute(
                """
                INSERT INTO appointments (name, phone, email, pet_type, service, date, time, message, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
                """,
                (name, phone, email, pet_type, service, date, time_, message, created_at),
            )
            conn.commit()

        return jsonify({"ok": True})

    # Optional simple admin view redirect (to JSON list)
    @app.get("/admin")
    def admin_redirect():
        return redirect(url_for("list_appointments"))

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)


