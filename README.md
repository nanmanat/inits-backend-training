## **Prerequisites:**
- Install **Node.js**, **PostgreSQL**, and **Postman**
- Code editor (**VS Code** recommended)
- Basic understanding of JavaScript (not mandatory but helpful)

---

## **Introduction to Backend (1 Hour)**
### **Concepts Covered**
1. What is backend development?  
2. Difference between frontend & backend  
3. Overview of backend components:
   - **Server**: Processes requests, runs business logic
   - **Database**: Stores and retrieves data
   - **APIs**: Connect frontend and backend
4. **How web applications work** (Request-Response cycle)
5. Tools & technologies used in backend (**Node.js, Express, PostgreSQL, REST APIs**)

### Setting up a Backend Project**
1. Open **VS Code** and initialize a Node.js project:
   ```sh
   mkdir backend-workshop && cd backend-workshop
   npm init -y
   ```
2. Install **Express.js**:
   ```sh
   npm install express
   ```
3. Create a **server.js** file and write:
   ```js
   const express = require("express");
   const app = express();
   
   app.get("/", (req, res) => {
       res.send("Backend is working!");
   });

   app.listen(3000, () => {
       console.log("Server running on port 3000");
   });
   ```
4. Run the server:
   ```sh
   node server.js
   ```
5. Open **http://localhost:3000** in the browser.

---

### **Build a Simple To-Do API**
1. Create a new file `todo.js` and write:
   ```js
   const express = require("express");
   const app = express();
   app.use(express.json());

   let tasks = [];

   // Get all tasks
   app.get("/tasks", (req, res) => {
       res.json(tasks);
   });

   // Add a task
   app.post("/tasks", (req, res) => {
       const task = { id: tasks.length + 1, text: req.body.text };
       tasks.push(task);
       res.json(task);
   });

   // Delete a task
   app.delete("/tasks/:id", (req, res) => {
       tasks = tasks.filter(task => task.id !== parseInt(req.params.id));
       res.json({ message: "Task deleted" });
   });

   app.listen(3000, () => {
       console.log("Task API running on port 3000");
   });
   ```
2. Test APIs using **Postman**:
   - `GET http://localhost:3000/tasks`
   - `POST http://localhost:3000/tasks` (Body: `{ "text": "Buy groceries" }`)
   - `DELETE http://localhost:3000/tasks/1`

---

### **Connect PostgreSQL to Express.js**
1. Install PostgreSQL and run:
   ```sh
   npm install pg
   ```
2. Create a new file `db.js`:
   ```js
   const { Pool } = require("pg");

   const pool = new Pool({
       user: "postgres",
       host: "localhost",
       database: "backend_workshop",
       password: "yourpassword",
       port: 5432,
   });

   module.exports = pool;
   ```
3. Modify `todo.js` to use PostgreSQL:
   ```js
   const pool = require("./db");

   app.get("/tasks", async (req, res) => {
       const result = await pool.query("SELECT * FROM tasks");
       res.json(result.rows);
   });

   app.post("/tasks", async (req, res) => {
       const result = await pool.query(
           "INSERT INTO tasks (text) VALUES ($1) RETURNING *",
           [req.body.text]
       );
       res.json(result.rows[0]);
   });

   app.delete("/tasks/:id", async (req, res) => {
       await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
       res.json({ message: "Task deleted" });
   });
   ```
4. Create **tasks table**:
   ```sql
   CREATE TABLE tasks (
       id SERIAL PRIMARY KEY,
       text VARCHAR(255) NOT NULL
   );
   ```

### **Add Authentication**
1. Install dependencies:
   ```sh
   npm install bcryptjs jsonwebtoken
   ```
2. Implement authentication:
   ```js
   const bcrypt = require("bcryptjs");
   const jwt = require("jsonwebtoken");

   const users = [];

   app.post("/register", async (req, res) => {
       const hashedPassword = await bcrypt.hash(req.body.password, 10);
       const user = { id: users.length + 1, username: req.body.username, password: hashedPassword };
       users.push(user);
       res.json({ message: "User registered" });
   });

   app.post("/login", async (req, res) => {
       const user = users.find(u => u.username === req.body.username);
       if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
           return res.status(401).json({ message: "Invalid credentials" });
       }
       const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1h" });
       res.json({ token });
   });
   ```
