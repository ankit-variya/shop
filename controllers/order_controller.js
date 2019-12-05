const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const admin = require('firebase-admin');
const serviceAccount = require('../config/testing-store-ebe01-firebase-adminsdk-zdy8c-cdf7ce4e07.json');
require('dotenv').config();

exports.orderPost = orderPost;
exports.or = or;
exports.orderById = orderById;
exports.orderDelete = orderDelete;
exports.orderList = orderList;
exports.pdfGenerator = pdfGenerator;
exports.firebaseStorage = firebaseStorage;

function pdfGenerator(product, result, next) {
    const doc = new PDFDocument();
   var ab = doc.pipe(fs.createWriteStream('uploads/orders/' + new Date().toISOString().replace(/:/g, '-') + '.pdf'));
    doc.font('Times-Roman')
        .fontSize(16)
        .text(product + result, 30, 30);
    doc.end();
    console.log("+++++++++", ab.path);
    firebaseStorage(ab);
    next();
}

function firebaseStorage(ab) {
    var firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
        apiKey: 'AIzaSyCi6ygoHuKKYvEBJJJZoWSPBtgWDXZvwVM',
        authDomain: 'testing-store-ebe01.firebaseapp.com',
        databaseURL: 'https://testing-store-ebe01.firebaseio.com',
        storageBucket: process.env.STORAGEBUCKET,
    };

    const fileUrl = ab.path;
    const filename = ab.path.replace(/^.*[\\\/]/, '');
    console.log('>>>===', filename);
    const opts = {
        destination: filename,
        metadata: {
            contentType: 'application/pdf'
        }
    };
    admin.initializeApp(firebaseConfig);
    admin.storage().bucket().upload(fileUrl, opts);
    // var storage = admin.storage();
    // var httpsReference = storage.ref('images/stars.pdf');
    // console.log(httpsReference);
}


function orderPost(req, res, next) {
    Product.findById(req.body.product)
        .then(product => {
            if (!product) {
                return res.status(500).json({
                    message: "product not found"
                })
            }                                                                                                                                                                                                                                                                                                                
            const order = new Order({
                product: req.body.product,
                quantity: req.body.quantity
            });
            order.save()
                .then(result => {
                    console.log('%c my friends', 'color: orange; font-size: 100px')
                    console.log('-----p---------',{product , result});
                  //  console.log('++++++r++++++++',result);
                    pdfGenerator(product, result, next);
                    res.status(201).json({
                        message: 'Order Sucessfully',
                        createdOrder: product + result,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3333/order/' + result
                        }
                    })
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}

function or(req, res, next) {
    const ord = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.product
    })
    ord.save()
        .then(result => {
            console.log(result);
            res.status(201).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
};


function orderById(req, res, next) {
    Order.findById(req.params.orderId)
        .populate('product')
        //.select('name price')
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: "order not found"
                })
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
};


function orderDelete(req, res, next) {
    Order.remove({ _id: req.params.orderId })
        .then(order => {
            res.status(200).json({
                message: 'order deleted',
                request: {
                    type: 'POST ',
                    url: 'http://localhost:3000/orders',
                    body: { productId: 'ID', quantity: "Number" }
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
};


function orderList(req, res, next) {
    Order.find()
        .select("product quantity _id")
        .populate('product', 'name')
        .then(docs => {
            console.log(docs);
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        result: doc,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3333/order/' + doc._id
                        }
                    }
                })

            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}