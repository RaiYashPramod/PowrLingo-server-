const dotenv = require('dotenv');
dotenv.config();
const  connectDb = require('./db');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');

connectDb();
const app = express();
app.use(express());
app.use(cors());
app.use(bodyParser.json());


app.use('/api/users', require('./routes/users'));
app.use('/api/questions', require('./routes/questions'));


app.listen(port, () => console.log(`Server started on ${port}`));