var express = require('express');
var router = express.Router();

const productController = require('../controllers/productController.js')
const cartController = require('../controllers/cartController.js')
const orderController = require('../controllers/orderController.js')
const adminController = require('../controllers/adminController.js')

router.get('/products', productController.getProducts)
router.get('/products/:id', productController.getProduct)

router.get('/cart', cartController.getCart)
router.post('/cart', cartController.postCart)
router.post('/cartItem/:id/add', cartController.addCartItem)
router.post('/cartItem/:id/sub', cartController.subCartItem)
router.delete('/cartItem/:id', cartController.deleteCartItem)

router.get('/orders', orderController.getOrders)
router.post('/orders', orderController.postOrder)
router.post('/order/:id/cancel', orderController.cancelOrder)

router.get('/admin/products', adminController.getProducts)
router.get('/admin/products/create', adminController.createProduct)
router.post('/admin/products', adminController.postProduct)
router.get('/admin/products/:id/edit', adminController.editProduct)
router.put('/admin/products/:id', adminController.putProduct)
router.delete('/admin/products/:id', adminController.deleteProduct)

router.get('/admin/orders', adminController.getOrders)
router.get('/admin/orders/:id', adminController.getOrder)
router.put('/admin/orders/:id', adminController.putOrder)

router.get('/order/:id/payment', orderController.getPayment)
router.post('/spgateway/callback', orderController.spgatewayCallback)

module.exports = router;
