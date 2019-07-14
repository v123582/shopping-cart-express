var express = require('express');
var router = express.Router();

const productController = require('../controllers/productController.js')
const cartController = require('../controllers/cartController.js')
const orderController = require('../controllers/orderController.js')
const adminController = require('../controllers/adminController.js')

const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role === 'admin') { 
        return next()
    }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

router.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

router.get('/products', productController.getProducts)
router.get('/products/:id', productController.getProduct)

router.get('/cart', cartController.getCart)
router.post('/cart', cartController.postCart)
router.post('/cartItem/:id/add', cartController.addCartItem)
router.post('/cartItem/:id/sub', cartController.subCartItem)
router.delete('/cartItem/:id', cartController.deleteCartItem)

router.get('/orders', authenticated, orderController.getOrders)
router.post('/orders', authenticated, orderController.postOrder)
router.post('/order/:id/cancel', authenticated, orderController.cancelOrder)

router.get('/admin/products', authenticatedAdmin, adminController.getProducts)
router.get('/admin/products/create', authenticatedAdmin, adminController.createProduct)
router.post('/admin/products', authenticatedAdmin, adminController.postProduct)
router.get('/admin/products/:id/edit', authenticatedAdmin, adminController.editProduct)
router.put('/admin/products/:id', authenticatedAdmin, adminController.putProduct)
router.delete('/admin/products/:id', authenticatedAdmin, adminController.deleteProduct)

router.get('/admin/orders', authenticatedAdmin, adminController.getOrders)
router.get('/admin/orders/:id', authenticatedAdmin, adminController.getOrder)
router.put('/admin/orders/:id', authenticatedAdmin, adminController.putOrder)

router.get('/order/:id/payment', authenticated, orderController.getPayment)
router.post('/spgateway/callback', orderController.spgatewayCallback)

module.exports = router;
