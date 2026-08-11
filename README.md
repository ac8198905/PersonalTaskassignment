# Personal Task Manager

A clean, modern, full-stack task management application built with the **MERN stack** (MongoDB, Express, React, Node.js).

![Stack](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Stack](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)

---

## Features

- **CRUD Operations** — Create, read, update, and delete tasks
- **Server-Side Filtering** — Filter tasks by status (`todo`, `in_progress`, `done`)
- **Server-Side Sorting** — Sort by due date, priority (logical: high > medium > low), or creation date
- **Real-Time UI Sync** — Optimistic updates with automatic rollback on failure
- **Validation** — Full input validation on both frontend and backend
- **Toast Notifications** — Non-intrusive success/error feedback
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Overdue Detection** — Visual indicator for overdue tasks
- **Delete Confirmation** — Prevents accidental deletions
- **Loading States** — Spinners and disabled buttons during async operations
- **Empty States** — Contextual messages when no tasks exist or no filter results
- **Error Handling** — Centralized middleware catches all errors; no stack traces in production

---

## Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Database   | MongoDB + Mongoose          |
| Backend    | Node.js, Express 5          |
| Frontend   | React 19 + Vite             |
| HTTP       | Axios                       |
| Styling    | Vanilla CSS (custom props)  |

---

## Folder Structure

```
neevedtask/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   └── taskController.js   # Request/response logic
│   │   ├── middleware/
│   │   │   ├── errorMiddleware.js  # Centralized error handler
│   │   │   └── validationMiddleware.js  # Input validation
│   │   ├── models/
│   │   │   └── Task.js            # Mongoose schema
│   │   ├── routes/
│   │   │   └── taskRoutes.js      # Route definitions
│   │   ├── app.js                 # Express app setup
│   │   └── server.js              # Entry point
│   ├── .env                       # Environment variables (gitignored)
│   ├── .env.example               # Template for environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorMessage.jsx   # Toast notification system
│   │   │   ├── FilterBar.jsx      # Status filter + sort controls
│   │   │   ├── LoadingState.jsx   # Loading spinner
│   │   │   ├── TaskCard.jsx       # Individual task display
│   │   │   ├── TaskForm.jsx       # Create/edit modal form
│   │   │   └── TaskList.jsx       # Task grid + empty states
│   │   ├── services/
│   │   │   └── taskApi.js         # Centralized Axios API calls
│   │   ├── App.jsx                # Root component + state management
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Design system + all styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── README.md
├── NOTES.md
└── .gitignore
```

---

## Installation

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** running locally on `mongodb://localhost:27017` (or a remote URI)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd neevedtask
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create your `.env` file (or copy the example):

```bash
cp .env.example .env
```

Edit `.env` if needed:

```env
MONGODB_URI=mongodb://localhost:27017/task-manager
PORT=5000
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:5000/api/tasks`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

> **Note:** The Vite dev server proxies `/api` requests to `http://localhost:5000`, so you don't need to configure CORS for local development.

---

## Environment Variables

| Variable       | Description                  | Default                                   |
|----------------|------------------------------|-------------------------------------------|
| `MONGODB_URI`  | MongoDB connection string    | `mongodb://localhost:27017/task-manager`   |
| `PORT`         | Backend server port          | `5000`                                    |
| `NODE_ENV`     | Environment mode             | `development`                             |

---

## API Documentation

Base URL: `http://localhost:5000/api`

### Endpoints

| Method   | Endpoint          | Description        | Status Codes       |
|----------|-------------------|--------------------|--------------------|
| `POST`   | `/api/tasks`      | Create a task      | `201`, `400`       |
| `GET`    | `/api/tasks`      | Get all tasks      | `200`, `400`       |
| `GET`    | `/api/tasks/:id`  | Get one task       | `200`, `400`, `404`|
| `PUT`    | `/api/tasks/:id`  | Update a task      | `200`, `400`, `404`|
| `DELETE` | `/api/tasks/:id`  | Delete a task      | `200`, `400`, `404`|

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Title is required"
}
```

### Query Parameters (GET /api/tasks)

#### Filtering

| Parameter | Values                         | Example                        |
|-----------|-------------------------------|-------------------------------|
| `status`  | `todo`, `in_progress`, `done` | `?status=todo`                |

#### Sorting

| Parameter | Values                           | Example                         |
|-----------|----------------------------------|---------------------------------|
| `sortBy`  | `dueDate`, `priority`, `createdAt` | `?sortBy=priority`            |
| `order`   | `asc`, `desc`                    | `?sortBy=dueDate&order=asc`   |

#### Combined

```
GET /api/tasks?status=todo&sortBy=priority&order=desc
```

> **Priority sorting** uses logical weights (`high=3, medium=2, low=1`) via MongoDB aggregation, not alphabetical order.

---

## Validation Rules

### Task Model

| Field         | Type   | Required | Constraints                                       |
|---------------|--------|----------|---------------------------------------------------|
| `title`       | String | Yes      | Non-empty, trimmed, max 200 chars                 |
| `description` | String | No       | Trimmed, max 2000 chars, defaults to `""`         |
| `priority`    | String | No       | `low` \| `medium` \| `high`, defaults to `medium` |
| `status`      | String | No       | `todo` \| `in_progress` \| `done`, defaults to `todo` |
| `dueDate`     | Date   | No       | Must be a valid date if provided                  |

### Query Parameters

- Unknown parameters → `400 Bad Request`
- Invalid status/sortBy/order values → `400 Bad Request`
- `order` without `sortBy` → `400 Bad Request`

---

## Design Decisions

1. **Separated app.js from server.js** — Makes the Express app testable without starting a TCP listener. `server.js` only handles startup concerns (env, DB connection, listen).

2. **Validation middleware layer** — All input validation happens before controllers execute. Controllers can assume valid data, keeping them focused on business logic.

3. **Priority sorting via aggregation** — MongoDB aggregation pipeline with `$switch` maps priority strings to numeric weights. This ensures `high > medium > low` regardless of locale or collation.

4. **Optimistic status updates** — Inline status changes immediately update the UI, then confirm with the server. On failure, the previous state is restored and an error toast is shown.

5. **Server-side filtering** — Filtering and sorting happen in MongoDB, not in React. This is critical for scalability — when there are thousands of tasks, you don't want to load them all into the browser.

6. **CSS custom properties** — The entire color palette, spacing, and animation timings are defined as CSS variables. This makes theming changes trivial and keeps the codebase consistent.

7. **No Redux** — A single-page task manager with one data entity doesn't benefit from Redux's boilerplate. React hooks (`useState`, `useEffect`, `useCallback`) handle all state cleanly.

8. **Toast system as a hook** — `useToast()` returns both the `addToast` function and the `ToastContainer` component. This avoids global state or context for a simple notification feature.

---

## Future Improvements

- **Pagination** — Add cursor-based pagination for large task lists
- **Search** — Full-text search on title and description
- **Drag-and-drop** — Kanban board view with drag-and-drop status changes
- **Dark/light theme toggle** — System preference detection with manual override
- **Due date reminders** — Browser notifications for upcoming deadlines
- **Bulk operations** — Multi-select tasks for batch status changes or deletion
- **User authentication** — JWT-based auth with private task lists per user
- **WebSockets** — Real-time sync across browser tabs
- **Undo deletion** — Soft delete with a timed undo action
- **Tags/categories** — Organize tasks with custom labels

---

## License

This project is for educational/personal use.
#
# PersonalTaskassignment
