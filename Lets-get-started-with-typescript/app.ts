import express from 'express';
import todoRoutes from './routes/todo';
import bodyParser from 'body-parser';

const app = express();

app.use(todoRoutes);
app.use(bodyParser.json());

// Start the server on port 4000
app.listen(4000);
