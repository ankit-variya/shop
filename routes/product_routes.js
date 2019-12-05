const express = require('express');
const router = express.Router();
const product_controller = require('../controllers/product_controller');
const multer = require('multer');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/product/')
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

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024* 1024 * 5},
    fileFilter: fileFilter      
})

router.post('/', auth, upload.single('productImage'), product_controller.addProduct);
router.get('/', auth, product_controller.productList);
router.put('/:productId', auth , product_controller.productUpdate);
router.delete('/:productId', auth, product_controller.productDelete);
module.exports = router;