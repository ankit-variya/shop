const mongoose = require('mongoose');
const Product = require('../models/product');

exports.addProduct = addProduct;
exports.productList = productList;
exports.productUpdate = productUpdate;
exports.productDelete = productDelete;

function addProduct(req, res, next){
    const prod = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        productImage: req.file.path
    })
    prod.save()
        .then(result => {
            res.status(201).json({
                message: 'created product successfully',
                createdProduct: {
                    result: result,
                    request: {
                        type: 'POST',
                        url: 'http://localhost:3333/product/' + result._id
                    }
                }
            })
        })
        .catch(({ errors }) => {
            res.status(500).json({
                errors: Object.values(errors).map(e => e.message)
            })
        })
}

function productList(req, res, next){
    Product.find({ name: { '$regex': req.body.name, '$options': 'i'}})
    .then(data => {
        const list = {
            count: data.length,
            products: data.map(info => {
              return {  
                result: info,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3333/product/' + info._id
                }
            }
            })
        }
        res.status(200).json(list);
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
}

function productUpdate(req, res, next){
    Product.findByIdAndUpdate({ _id: req.params.productId }, req.body)
    .then(result => {
        console.log(result)
        res.status(200).json({
            message: 'Product updated',
            request: {
                type: 'PUT',
                url: 'http://localhost:3333/product/'
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
}

function productDelete(req, res, next){
    const id = req.params.productId;
    Product.remove({ _id: id })
        .then(result => {
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3333/product',
                    body: { name: 'String', price: 'Number'}
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

