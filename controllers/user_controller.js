const User = require('../models/user');
const Role = require('../models/role');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const common_controller = require('./common_controller');
const otplib = require('otplib');
const Speakeasy = require("speakeasy");
const crypto = require('crypto');
const fs = require('fs');
const excel = require('exceljs');
require('dotenv').config();

exports.registration = registration;
exports.save_model_data = save_model_data;
exports.login = login;
exports.userList = userList;
exports.mongo2excel = mongo2excel;
// exports.uploadExcel = uploadExcel;
// exports.importExcelData2MongoDB = importExcelData2MongoDB;

exports.resetPassword = resetPassword;
exports.forgotPassword = forgotPassword;
exports.repassword = repassword;
exports.log = log;
exports.secret = secret;
exports.generate = generate;
exports.validate = validate;


function save_model_data(req, res, email, hash) {
    const newuser = new User({
        // _id: new mongoose.Types.ObjectId(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        address: req.body.address,
        mobileNo: req.body.mobileNo,
        profileImage: req.file.path
    })
    newuser.save()
        .then(result => {
            const userrole = new Role({
                user_id: newuser._id,
                role: req.body.role
            })
            const token = result.email_verified_key;
            userrole.save()
            common_controller._sendmail(email, token, res);
        })
        .catch(({ errors }) => {
            res.status(500).json({
                errors: Object.values(errors).map(e => e.message)
            })
        })
}

function registration(req, res, next) {
    const email = req.body.email;
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
                })
            } else {
                console.log("ooo", req.body.password);
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            message: 'please enter all required field',
                            error: err
                        })
                    } else {
                        save_model_data(req, res, email, hash);
                    }
                })
            }
        })
}

function login(req, res, next) {
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            res.status(500).json({
                error: err
            })
        } else {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            } else {
                bcrypt.compare(req.body.password, user.password, function (err, result) {
                    if (err) {
                        return res.status(401).json({
                            message: 'Auth failed'
                        })
                    } else {
                        console.log("....", result);
                        console.log("--------", user);
                        const token = jwt.sign({
                            _id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            mobileNo: req.body.mobileNo,
                            address: user.address
                        }, process.env.SECRET,
                            {
                                expiresIn: '1h'
                            });
                        return res.status(200).json({
                            message: 'Auth successful',
                            token: token
                        })
                    }
                })
            }
        }
    })
}

function log(req, res, next) {
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    })
                }
                if (result) {
                    const token = jwt.sign({
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        mobileNo: req.body.mobileNo,
                        address: user.address
                    }, process.env.SECRET,
                        {
                            expiresIn: '1h'
                        });
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    })
                }
                res.status(401).json({
                    message: 'Auth failed'
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Mail is not exist',
                error: err
            })
        })
}

function userList(req, res, next) {
    User.find()
        .then(result => {
            res.status(200).json({
                count: result.length,
                data: result,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3333/user/' + result._id
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

function mongo2excel(req, res, next){
    User.find({}, function(err, result){
        if(err) throw err;

        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet('users');
        worksheet.columns = [
            { header: 'Id', key: '_id', width: 20},
            { header: 'firstName', key: 'firstName', width: 10}, 
            { header: 'lastName', key: 'lastName', width: 10},
            { header: 'address', key: 'address', width: 30},
            { header: 'email', key: 'email', width: 20},
            { header: 'mobileNo', key: 'mobileNo', width: 15},
            { header: 'email_verified_key', key: 'email_verified_key', width: 6},
            { header: 'email_verified', key: 'email_verified', width: 5},
            { header: 'password', key: 'password', width: 50},
            { header: 'is_active', key: 'is_active', width: 9},
            { header: 'remember_token', key: 'remember_token', width: 20},
            { header: 'created_at', key: 'created_at', width: 30},
            { header: 'updated_at', key: 'updated_at', width: 30}, 
            { header: 'profileImage', key: 'profileImage', width: 50},
        ];

        worksheet.addRows(result);
        workbook.xlsx.writeFile("./uploads/mongo2excel/"+ new Date().toISOString().replace(/:/g, '-') +".xlsx")
        .then(function(){
            console.log("file saved!");
        })
    })
}


// function forgotPassword(req, res, next) {
//     const email = req.body.email;
//     User.findOne({ email: req.body.email })
//         .exec()
//         .then(user => {
//             if(user.length < 1) {
//                 res.status(401).json({
//                     message: 'mail not exist'
//                 })
//             } else {
//                 console.log('100');
//                 res.status(200).json({
//                     result: user
//                 })
//                 .then( rest => {
//                     const token = result.email_verified_key;
//                     common_controller._sendmail(email, token, res);
//                 }) 
//             }
//         })
//         .catch(err => {
//             console.log('500');
//             res.status(500).json({
//                 message: 'Mail is not exist',
//                 error: err
//             })
//         })
// }


function forgotPassword(req, res, next) {
    const email = req.body.email;
    User.findOne({ email: email })
        .then(user => {
            const token = user.email_verified_key;
            common_controller._mail(email, token, res);
        })
        .catch(err => {
            res.send({
                error: err
            })
        })
}

async function repassword(req, res, next) {
    exports.retap = retap;
    exports.retel = retel;
    exports.regel = regel;
    await crypto.randomBytes(20, function (err, buf) {
        let token = buf.toString('hex');
        retap(err, token)
    }),
        async function retap(token, callback) {
            await User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    res.send('this email is not exists.');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save(function (err) {
                    retel(err, token, user)
                });
            })
        },
        async function retel(token, user, callback) {
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'spacecode11@gmail.com',
                    pass: '122334@spacecode'
                }
            });
            let mailOptions = {
                to: user.email,
                from: 'spacecode11@gmail.com',
                subject: 'Node.js password Reset',
                text: 'http://' + req.headers.host + '/reset/' + token
            }
            await smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                res.send('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                regel(err, 'callback')
            });
        },
        async function regel(err) {
            if (err) return next(err);
        }
}

function resetPassword(req, res, next) {
    var secret = "NN5S6OCAIY7GE5LOGBNWK6SKGIUVER2F";
    res.send({
        "valid": Speakeasy.totp.verify({
            secret: secret.base32,
            encoding: "base32",
            token: req.body.token,
            window: 0
        })
    })
}


function secret(req, res, next) {
    var secret = Speakeasy.generateSecret({ length: 20 });
    res.send({ "secret": secret.base32 });
}

function generate(req, res, next) {
    var secret = "NN5S6OCAIY7GE5LOGBNWK6SKGIUVER2F";
    res.send({
        "token": Speakeasy.totp({
            secret: secret.base32,
            encoding: "base32"
        }),
        // "remaining": (30 - Math.floor((new Date()).getTime() / 1000.0 % 30))
    })
}

function validate(req, res, next) {
    var secret = "NN5S6OCAIY7GE5LOGBNWK6SKGIUVER2F";
    res.send({
        "valid": Speakeasy.totp.verify({
            secret: secret.base32,
            encoding: "base32",
            token: req.body.token,
            window: 0
        })
    })
}

