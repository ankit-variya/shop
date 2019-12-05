const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/user_controller');
const multer = require('multer');
const excelToJson = require('convert-excel-to-json');
const User = require('../models/user');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/')
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, true);
    }
}

// const fileFilter = (req, file, cb) => {
//     if(file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ){
//         cb(null, true);
//     } else {
//         cb(null, true);
//     }
// }

const upload = multer({
    storage: storage,
    limits: { fileSize: 500* 500 * 5},
    fileFilter: fileFilter
})

router.post('/register', upload.single('profileImage'), user_controller.registration);
router.post('/login', user_controller.login);
router.get('/userList', user_controller.userList);
router.post('/mongo2excel', user_controller.mongo2excel);

router.post('/reset-password', user_controller.resetPassword);
router.post('/forgot-password', user_controller.forgotPassword);
router.post('/repassword', user_controller.repassword);
router.post('/log', user_controller.log);

router.post('/totp-secret', user_controller.secret);
router.post('/totp-generate', user_controller.generate);
router.post('/totp-validate', user_controller.validate);


const storag = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
});
 
const uploadd = multer({storage: storag});

global.__basedir = __dirname;
router.post('/uploadExcel', uploadd.single("excel"), function uploadExcel(req, res, next){
    importExcelData2MongoDB( './uploads/' +  req.file.filename);
    console.log('ooo', req.file.filename)
    res.json({
        'msg': 'File uploaded/import successfully!', 'file': req.file
    });
});

function importExcelData2MongoDB(filePath){
    const excelData = excelToJson({
        sourceFile: filePath,
        sheets:[{
            name: 'Users',
            // header: {
            //     rows: 1
            // }, 
            columnToKey: {
                A: 'Id',
                B: 'firstName',
                C: 'lastName',
                D: 'address',
                E: 'email',
                F: 'mobileNo',
                G: 'email_verified_key',
                H: 'email_verified',
                I: 'password',
                J: 'is_active',
                K: 'remember_token',
                L: 'created_at',
                M: 'updated_at',
                N: 'profileImage'
            }
        }]
    });
    console.log(excelData);
    User.insertMany(excelData.Users, (err, data) => {
        if(err) throw err;
        console.log("Number of documents inserted: " + data.insertedCount);
    })
}

module.exports = router;