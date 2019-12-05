const nodemailer = require('nodemailer');
const otplib = require('otplib');
const Speakeasy = require("speakeasy");
require('dotenv').config();

exports._sendmail = _sendmail;
exports._mail = _mail;

function _sendmail(email, token, res){
    console.log("{{{{", email)
    console.log(process.env.EMAIL);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    var link = process.env.DOMAIN_URL + "/?email="+ email +"&&token=" +token
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        cc: '',
        bcc: '',
        subject: 'Sending Email using Node.js',
        text: 'this is done?',
        html: "please verify your email <a href="+link+"> click here</a>"
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            res.status(500).json({
                error: error
            })
        } else {
            res.status(201).json({
                message: 'please check your email and verified your account',
                result: info.response
            });
        }
    })
}

function _mail(email, token, res){
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    const secret = "NN5S6OCAIY7GE5LOGBNWK6SKGIUVER2F";
    const otp = Speakeasy.totp({
            secret: secret.base32,
            encoding: "base32"
        });
    var link = process.env.DOMAIN_URL + "/?email="+ email +"&&token=" +token
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        cc: '', 
        bcc: '',
        subject: 'Sending Email using Node.js',
        text: 'this is done?',
        html: "create new password <a href="+link+"> click here</a> <br /> <h1>" + otp +"</h1>"
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            res.status(500).json({
                error: error
            })
        } else {
            res.status(201).json({
                message: 'please check your email and verified your account',
                result: info.response
            })
        }
    })
}

