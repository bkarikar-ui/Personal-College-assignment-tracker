
# Sprint 2: Persistent Backend, API Contracts & Relational Database

## 1. Project Recap

For Sprint 2, I upgraded my Personal College Assignment Tracker by connecting the frontend to a Flask backend and a SQLite database.

The application now allows users to:
- View assignments stored in the database.
- Add new assignments.
- Edit existing assignments.
- Mark assignments as completed.
- Delete assignments.
- Keep assignment data saved even after refreshing the browser.

The frontend communicates with the backend using REST API requests and JavaScript fetch().


## 2. API Contract

The backend uses REST API endpoints to manage assignments.

| Method | Endpoint | Purpose | Expected Response |
|---|---|---|---|
| GET | /api/assignments | Retrieve all assignments | 200 OK |
| POST | /api/assignments | Create a new assignment | 201 Created |
| PUT | /api/assignments/<id> | Update an existing assignment | 200 OK |
| DELETE | /api/assignments/<id> | Delete an assignment | 204 No Content |

### Validation and Error Responses

- 400 Bad Request: Returned when assignment information is missing or invalid.
- 404 Not Found: Returned when an assignment ID does not exist.
- 201 Created: Returned when a new assignment is successfully added.
- 204 No Content: Returned when an assignment is successfully deleted.


## 3. Database Schema

The application uses SQLite to store assignment information permanently.

The database file is located at `backend/assignments.db`.

### Assignments Table

| Column | Data Type | Description |
|---|---|---|
| id | INTEGER | Primary key that automatically increases |
| title | TEXT | Assignment title |
| course | TEXT | Course associated with the assignment |
| due_date | TEXT | Assignment due date |
| priority | TEXT | Low, Medium, or High |
| completed | INTEGER | Stores completion status (0 or 1) |
| description | TEXT | Additional assignment details |

The `id` column is the primary key. It uniquely identifies each assignment.

The database uses `AUTOINCREMENT` to generate a unique ID whenever a new assignment is added.


## 4. Run and Test Instructions

### Requirements
- Python 3
- Flask
- Visual Studio Code
- A web browser

### Starting the Backend

1. Open the project folder in Visual Studio Code.
2. Open the terminal.
3. Start the Flask backend using:

```powershell
& "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe" backend/app.py
```

4. The backend runs at `http://127.0.0.1:5001`.

### Opening the Frontend

1. Open the `frontend` folder.
2. Open `index.html` using the VS Code Live Server extension.
3. The assignment tracker will open in the browser.

### Testing the Application

The following operations were tested successfully:

1. Loading existing assignments from SQLite.
2. Adding a new assignment.
3. Refreshing the browser to confirm data persistence.
4. Editing an existing assignment.
5. Marking an assignment as completed.
6. Deleting an assignment and confirming it stays deleted after refreshing.

All four API operations were tested successfully.


## 5. AI Usage Log and Reflection

I used AI assistance to help develop and troubleshoot my Flask backend, connect the frontend to the API, and create the SQLite database.

AI helped me understand:
- How REST API endpoints work.
- How to use GET, POST, PUT, and DELETE requests.
- How to connect JavaScript fetch() requests to Flask.
- How SQLite stores assignment information.
- How to troubleshoot errors during development.

I reviewed the code, followed the implementation steps, and tested the features myself.

### Reflection

This sprint helped me understand the importance of separating the frontend and backend. I learned how to use Flask to create API endpoints and SQLite to store information permanently. I also learned that using a database allows assignments to remain saved even after refreshing the browser.

One challenge was connecting the frontend to the backend and making sure that changes were saved correctly. Testing each API operation helped me understand how the different parts of the application work together.


## 6. JSON-to-SQLite Migration Reflection

I initially used a JSON file to store assignment information while developing the backend. This helped me understand how data could be saved and retrieved before introducing a relational database.

After testing the JSON-based backend, I migrated the assignment information into SQLite.

The SQLite database uses an assignments table with columns for the assignment ID, title, course, due date, priority, completion status, and description.

I also created a backup of the original JSON data before migrating.

### What I Learned

- JSON is useful for simple data storage.
- SQLite provides a more structured way to store information.
- Primary keys help uniquely identify records.
- SQL commands allow information to be inserted, updated, retrieved, and deleted.
- Migrating data requires making sure existing information is preserved.

Using SQLite made my assignment tracker more reliable because assignment information is now stored in a relational database.
