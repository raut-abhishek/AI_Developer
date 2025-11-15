
import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import projectRoutes from './routes/project.routes.js'


connect();


// initialize express
const app = express();


app.use(cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.use('/user',userRoutes);
app.use('/projects', projectRoutes);


app.get('/', (req, res)=>{
    res.json('Hello World');
});

export default app;
