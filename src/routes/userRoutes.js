const { registerUser, register_user } = require('../controllers/userController')
const express = require('express');
const bodyParser = require('body-parser');


const user_router = express.Router()

user_router.use(bodyParser.json());



user_router.post('/register', register_user);

module.exports = user_router
