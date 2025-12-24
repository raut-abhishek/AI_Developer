
import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import projectRoutes from './routes/project.routes.js'
import aiRoutes from './routes/ai.routes.js';
import path from "path";
import { fileURLToPath } from "url";

connect();


// initialize express
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-developer-i45a.onrender.com"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.use('/user',userRoutes);
app.use('/projects', projectRoutes);
app.use('/ai', aiRoutes);


app.use(express.static(path.join(__dirname, "dist")));

app.get(new RegExp(".*"), (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
export default app;
