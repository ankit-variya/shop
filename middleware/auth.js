const User = require('../models/user');
var jwt = require('jsonwebtoken'); 
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        const decoded = jwt.verify(token, process.env.SECRET);
        console.log("----", decoded);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
}