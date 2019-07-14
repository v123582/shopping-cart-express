const db = require('../models')
const Product = db.Product
const Cart = db.Cart
const PAGE_LIMIT = 9;
const PAGE_OFFSET = 0;

let productController = {
  getProducts: (req, res) => {
    if(req.query.page < 1)
      return res.send('page error')

    const offset = ((req.query.page || 1) - 1) * PAGE_LIMIT
    Product.findAndCountAll({offset: offset, limit: PAGE_LIMIT}).then(products => {
      
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(products.count / PAGE_LIMIT)
      let totalPage = Array.from({length: pages}).map((item, index) => index + 1)
      let prev = page-1 < 1 ? 1 : page - 1
      let next = page+1 > pages ? pages : page + 1

      return Cart.findByPk(req.session.cartId, {include: 'items'}).then(cart => {
        cart = cart || {items: []}
        let totalPrice = cart.items.length > 0 ? cart.items.map(d => d.price * d.CartItem.quantity).reduce((a, b)=>a+b) : 0

        return res.render('products', {products, totalPrice, page, pages, totalPage, prev, next, cart})
      })
    })
  },
  getProduct: (req, res) => {
    return Product.findByPk(req.params.id, {}).then(product => {
      return Cart.findByPk(req.session.cartId, {include: 'items'}).then(cart => {
        cart = cart || {items: []}
        let totalPrice = cart.items.length > 0 ? cart.items.map(d => d.price * d.CartItem.quantity).reduce((a, b)=>a+b) : 0

        return res.render('product', {product, totalPrice, cart})
      })
    })
  },
}

module.exports = productController