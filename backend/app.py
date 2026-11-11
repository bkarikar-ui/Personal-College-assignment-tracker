
from flask import Flask, jsonify, request
import json
from pathlib import Path
import sqlite3

app = Flask(__name__)
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

# Location of our temporary JSON storage file
DATA_FILE = Path(__file__).parent / "assignments.json"

DB_FILE = Path(__file__).parent / "assignments.db"


def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                course TEXT NOT NULL,
                due_date TEXT NOT NULL,
                priority TEXT NOT NULL,
                completed INTEGER NOT NULL DEFAULT 0,
                description TEXT NOT NULL DEFAULT ''
            )
        """)

def migrate_json_to_db():
    if not DATA_FILE.exists():
        return

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        assignments = json.load(file)

    with sqlite3.connect(DB_FILE) as conn:
        for assignment in assignments:
            conn.execute("""
                INSERT OR IGNORE INTO assignments
                (id, title, course, due_date, priority, completed, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                assignment["id"],
                assignment["title"],
                assignment["course"],
                assignment["due_date"],
                assignment["priority"],
                int(assignment["completed"]),
                assignment.get("description", "")
            ))


def load_assignments():
    """Read assignments from the JSON file."""
    if not DATA_FILE.exists():
        return []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_assignments(assignments):
    """Save assignments to the JSON file."""
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(assignments, file, indent=4)


@app.route("/")
def home():
    return jsonify({
        "message": "Personal Assignment Tracker API is running!"
    })


# GET: Retrieve all assignments
@app.route("/api/assignments", methods=["GET"])
def get_assignments():
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM assignments"
        ).fetchall()

    assignments = [dict(row) for row in rows]

    for assignment in assignments:
        assignment["completed"] = bool(assignment["completed"])

    return jsonify(assignments), 200


# POST: Create a new assignment
@app.route("/api/assignments", methods=["POST"])
def add_assignment():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    required_fields = ["title", "course", "due_date", "priority"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    if data["priority"] not in ["Low", "Medium", "High"]:
        return jsonify({"error": "Invalid priority"}), 400

    completed = data.get("completed", False)

    if not isinstance(completed, bool):
        return jsonify({"error": "Completed must be true or false"}), 400

    description = data.get("description", "")

    if not isinstance(description, str):
        return jsonify({"error": "Description must be text"}), 400

    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.execute("""
            INSERT INTO assignments
            (title, course, due_date, priority, completed, description)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data["title"],
            data["course"],
            data["due_date"],
            data["priority"],
            int(completed),
            description
        ))

        assignment_id = cursor.lastrowid

    return jsonify({
        "id": assignment_id,
        "title": data["title"],
        "course": data["course"],
        "due_date": data["due_date"],
        "priority": data["priority"],
        "completed": completed,
        "description": description
    }), 201

# PUT: Update an existing assignment
@app.route("/api/assignments/<int:assignment_id>", methods=["PUT"])
def update_assignment(assignment_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    required_fields = ["title", "course", "due_date", "priority"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    if data["priority"] not in ["Low", "Medium", "High"]:
        return jsonify({"error": "Invalid priority"}), 400

    completed = data.get("completed", False)

    if not isinstance(completed, bool):
        return jsonify({"error": "Completed must be true or false"}), 400

    description = data.get("description", "")

    if not isinstance(description, str):
        return jsonify({"error": "Description must be text"}), 400

    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.execute("""
            UPDATE assignments
            SET title = ?, course = ?, due_date = ?,
                priority = ?, completed = ?, description = ?
            WHERE id = ?
        """, (
            data["title"],
            data["course"],
            data["due_date"],
            data["priority"],
            int(completed),
            description,
            assignment_id
        ))

        if cursor.rowcount == 0:
            return jsonify({"error": "Assignment not found"}), 404

    return jsonify({
        "id": assignment_id,
        "title": data["title"],
        "course": data["course"],
        "due_date": data["due_date"],
        "priority": data["priority"],
        "completed": completed,
        "description": description
    }), 200

# DELETE: Remove an assignment
@app.route("/api/assignments/<int:assignment_id>", methods=["DELETE"])
def delete_assignment(assignment_id):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.execute(
            "DELETE FROM assignments WHERE id = ?",
            (assignment_id,)
        )

        if cursor.rowcount == 0:
            return jsonify({"error": "Assignment not found"}), 404

    return "", 204

if __name__ == "__main__":
    init_db()
    migrate_json_to_db()
    app.run(host="127.0.0.1", port=5001, debug=True)