require("dotenv").config()
const express = require("express");
const pool = require('./config/database');
const axios = require('axios');
const user_router = require("./src/routes/userRoutes");


const port = process.env.PORT || 3000;
const app = express();

app.use(user_router)


// Test the database connection
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database:', result.rows[0].now);
    }
});


app.listen(port, () => { console.log(`server is working ${port}`) })
