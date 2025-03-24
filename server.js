import express from 'express';
import pool from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authenticateToken from './authMiddleware.js';

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/', (req, res) => {
    res.send("Backend is working");
})

app.get('/tasks', authenticateToken, async (req, res) => {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);
})

app.post('/tasks', async (req, res) => {
    const result = await pool.query("INSERT INTO tasks (name) VALUES ($1) RETURNING *", [req.body.name]);
    res.json(result.rows[0]);
})

app.delete('/tasks/:id', async (req, res) => {
    await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    res.json({ message: "Task deleted"});
})

app.put('/tasks/:id', async (req, res) => { 
    const result = await pool.query(
        "UPDATE tasks SET name = $1 WHERE id = $2 RETURNING *",
        [req.body.name, req.params.id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Task not found"});
    }

    res.json(result.rows[0]);
})

app.listen(3000, () => {
    console.log("Server running on port 3000");
});