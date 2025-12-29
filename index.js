import express from "express";
import cors from "cors";
import pkg from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());

function auth(req,res,next){
  const token=req.headers.authorization?.split(" ")[1];
  if(!token) return res.sendStatus(401);
  try{
    req.user=jwt.verify(token,process.env.JWT_SECRET);
    next();
  }catch{res.sendStatus(403);}
}

app.post("/auth/login",async(req,res)=>{
  const u=await pool.query("SELECT * FROM users WHERE username=$1",[req.body.username]);
  if(!u.rows.length) return res.sendStatus(401);
  const ok=await bcrypt.compare(req.body.password,u.rows[0].password);
  if(!ok) return res.sendStatus(401);
  const token=jwt.sign({role:u.rows[0].role},process.env.JWT_SECRET);
  res.json({token,role:u.rows[0].role});
});

app.get("/data",auth,async(req,res)=>{
  const r=await pool.query("SELECT * FROM inventory ORDER BY id DESC");
  res.json(r.rows);
});

app.post("/data",auth,async(req,res)=>{
  await pool.query(
    "INSERT INTO inventory(name,role,asset_desc,asset_id) VALUES($1,$2,$3,$4)",
    [req.body.name,req.body.role,req.body.assetDesc,req.body.assetId]
  );
  res.sendStatus(201);
});

app.delete("/data/:id",auth,async(req,res)=>{
  if(req.user.role!=="admin") return res.sendStatus(403);
  await pool.query("DELETE FROM inventory WHERE asset_id=$1",[req.params.id]);
  res.sendStatus(204);
});

app.listen(3000,()=>console.log("API running"));
