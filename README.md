# Cloud-Powered Task Manager

A simple CRUD web application for managing tasks, built with Node.js, Express,
and **IBM Cloudant** (a fully managed NoSQL document database on IBM Cloud).

## Features
- Add a task (title + optional description)
- View all tasks
- Mark a task as done / undo
- Delete a task

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** IBM Cloudant (NoSQL)
- **Frontend:** HTML, CSS, vanilla JavaScript

## Project Structure
```
task-manager/
├── server.js          # Express server + Cloudant CRUD routes
├── package.json
├── .env.example        # Template for your Cloudant credentials
└── public/
    └── index.html       # Frontend UI
```

## Setup Instructions

### 1. Create an IBM Cloudant instance
1. Sign up for a free [IBM Cloud](https://cloud.ibm.com) account.
2. From the dashboard, click **Create Resource** → search **Cloudant** → choose the **Lite (free)** plan.
3. Once created, open the instance and go to **Service Credentials** → **New Credential** → generate.
4. Copy the `url` and `apikey` values.

### 2. Configure environment variables
Rename `.env.example` to `.env` and fill in your values:
```
CLOUDANT_URL=https://your-instance-id.cloudantnosqldb.appdomain.cloud
CLOUDANT_APIKEY=your-api-key-here
PORT=3000
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run the app
```bash
npm start
```
Then open **http://localhost:3000** in your browser. The `tasks` database
is created automatically in Cloudant the first time you run the server.

## API Endpoints
| Method | Route         | Description          |
|--------|---------------|----------------------|
| GET    | /tasks        | Get all tasks        |
| POST   | /tasks        | Create a new task     |
| PUT    | /tasks/:id    | Update a task         |
| DELETE | /tasks/:id    | Delete a task         |

## Notes
This project was built as part of a cloud computing internship assignment
to demonstrate CRUD operations against a NoSQL cloud database (IBM Cloudant).
