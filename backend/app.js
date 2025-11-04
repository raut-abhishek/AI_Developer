
import express from 'express';
import morgan from 'morgan';


// initialize express
const app = express();


app.use(morgan(dev));



app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get('/', (req, res)=>{
    res.json('Hello World');
});

export default app;
