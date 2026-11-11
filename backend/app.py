
from flask import Flask, jsonify, request
import json
from pathlib import Path

app = Flask(__name__)

# Location of our temporary JSON storage file
DATA_FILE = Path(__file__).parent / "assignments.json"


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
    assignments = load_assignments()
    return jsonify(assignments), 200


# POST: Create a new assignment
@app.route("/api/assignments", methods=["POST"])
def create_assignment():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required."}), 400

    title = data.get("title")
    course = data.get("course")
    due_date = data.get("due_date")
    priority = data.get("priority")
    completed = data.get("completed", False)
    description = data.get("description", "")

    # Validate required text fields
    if not all(
        isinstance(value, str) and value.strip()
        for value in [title, course, due_date, priority]
    ):
        return jsonify({
            "error": "Title, course, due date, and priority are required."
        }), 400

    # Validate priority
    if priority.strip().lower() not in ["low", "medium", "high"]:
        return jsonify({
            "error": "Priority must be Low, Medium, or High."
        }), 400

    # Validate completed
    if not isinstance(completed, bool):
        return jsonify({
            "error": "Completed must be true or false."
        }), 400

    # Validate description
    if not isinstance(description, str):
        return jsonify({
            "error": "Description must be text."
        }), 400

    assignments = load_assignments()

    # Generate a new ID
    new_id = max(
        (assignment.get("id", 0) for assignment in assignments),
        default=0
    ) + 1

    new_assignment = {
        "id": new_id,
        "title": title.strip(),
        "course": course.strip(),
        "due_date": due_date.strip(),
        "priority": priority.strip().capitalize(),
        "completed": completed,
        "description": description.strip()
    }

    assignments.append(new_assignment)
    save_assignments(assignments)

    return jsonify(new_assignment), 201

# PUT: Update an existing assignment
@app.route("/api/assignments/<int:assignment_id>", methods=["PUT"])
def update_assignment(assignment_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return jsonify({
            "error": "A valid JSON object is required."
        }), 400

    assignments = load_assignments()

    assignment = next(
        (item for item in assignments
         if item.get("id") == assignment_id),
        None
    )

    if assignment is None:
        return jsonify({
            "error": "Assignment not found."
        }), 404

    allowed_fields = [
        "title", "course", "due_date",
        "priority", "completed", "description"
    ]

    if not any(field in data for field in allowed_fields):
        return jsonify({
            "error": "No valid fields provided."
        }), 400

    for field in allowed_fields:
        if field not in data:
            continue

        value = data[field]

        if field == "completed":
            if not isinstance(value, bool):
                return jsonify({
                    "error": "Completed must be true or false."
                }), 400

        elif field == "priority":
            if not isinstance(value, str) or value.strip().lower() not in [
                "low", "medium", "high"
            ]:
                return jsonify({
                    "error": "Priority must be Low, Medium, or High."
                }), 400

            value = value.strip().capitalize()

        else:
            if not isinstance(value, str):
                return jsonify({
                    "error": f"{field} must be text."
                }), 400

            value = value.strip()

            if field != "description" and not value:
                return jsonify({
                    "error": f"{field} cannot be empty."
                }), 400

        assignment[field] = value

    save_assignments(assignments)

    return jsonify(assignment), 200

# DELETE: Remove an assignment
@app.route("/api/assignments/<int:assignment_id>", methods=["DELETE"])
def delete_assignment(assignment_id):
    assignments = load_assignments()

    assignment = next(
        (item for item in assignments if item.get("id") == assignment_id),
        None
    )

    if assignment is None:
        return jsonify({"error": "Assignment not found."}), 404

    assignments.remove(assignment)
    save_assignments(assignments)

    return "", 204

if __name__ == "__main__":
      app.run(host="127.0.0.1", port=5001, debug=True)