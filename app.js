const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const morgan = require('morgan');
const user_routes = require('./routes/user_routes');
const product_routes = require('./routes/product_routes');
const order_routes = require('./routes/order_routes');
require('dotenv').config();

mongoose.set('useCreateIndex', true);
mongoose.connect("mongodb://localhost:27017/restaurant",
{ useNewUrlParser: true, useUnifiedTopology: true},
    err => {
        if(err) throw err.message;
        console.log("mongodb connection successfully");
    })
    
    mongoose.Promise = global.Promise;
app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
})

app.use('/user', user_routes);
app.use('/product', product_routes);
app.use('/order', order_routes);



const server = app.listen(process.env.PORT, () => {
    console.log('server started on', process.env.PORT);
})

// const io = require('socket.io')(server);

// io.on('connection', (socket) => {
//     console.log('user connected');
//     socket.on('test', (data)=>{
//         console.log(data);
//       })
// })

// app.set('socketio', io);

