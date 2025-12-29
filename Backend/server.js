import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/assets", async (_, res) => {
  const { rows } = await pool.query("SELECT * FROM assets ORDER BY id DESC");
  res.json(rows);
});

app.post("/assets", async (req, res) => {
  const { name, role, asset, serial } = req.body;
  await pool.query(
    "INSERT INTO assets (name, role, asset, serial) VALUES ($1,$2,$3,$4)",
    [name, role, asset, serial]
  );
  res.json({ success: true });
});

app.delete("/assets/:id", async (req, res) => {
  await pool.query("DELETE FROM assets WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

app.listen(process.env.PORT || 5000, () =>
  console.log("API running")
);
