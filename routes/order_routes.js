const express = require('express');
const router = express.Router();
const order_controller = require('../controllers/order_controller');
const auth = require('../middleware/auth'); 

router.post('/', auth, order_controller.orderPost);
router.post('/or', auth, order_controller.or);
router.get('/', auth, order_controller.orderList);
router.get('/:orderId', auth, order_controller.orderById);
router.delete('/:orderId', auth, order_controller.orderDelete);

module.exports = router;