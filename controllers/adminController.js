const db = require('../models')
const Product = db.Product
const Order = db.Order
const PAGE_LIMIT = 5;
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

      return res.render('admin/products', {products, totalPage, page, pages, totalPage, prev, next})
    })
  },
  createProduct: (req, res) => {
    return res.render('admin/create')
  },
  postProduct: (req, res) => {
    Product.create({
      ...req.body
    }).then(product => {
      return res.redirect('/admin/products')
    })
  },
  editProduct: (req, res) => {
    return Product.findByPk(req.params.id, {}).then(product => {
      console.log(product)
      return res.render('admin/edit', {product})
    })
  },
  putProduct: (req, res) => {
    return Product.findByPk(req.params.id, {}).then(product => {
      product.update({
        ...req.body
      }).then(product => {
        return res.redirect('/admin/products')
      })
    })
  },
  deleteProduct: (req, res) => {
    return Product.findByPk(req.params.id).then(product => {
      product.destroy()
      .then((product) => {
        return res.redirect('back')
      })
    })
  },
  getOrders: (req, res) => {
    if(req.query.page < 1)
      return res.send('page error')

    const offset = ((req.query.page || 1) - 1) * PAGE_LIMIT
    Order.findAndCountAll({offset: offset, limit: PAGE_LIMIT}).then(orders => {
      
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(orders.count / PAGE_LIMIT)
      let totalPage = Array.from({length: pages}).map((item, index) => index + 1)
      let prev = page-1 < 1 ? 1 : page - 1
      let next = page+1 > pages ? pages : page + 1

      return res.render('admin/orders', {orders, totalPage, page, pages, totalPage, prev, next})
    })
  },
  getOrder: (req, res) => {
    return Order.findByPk(req.params.id, {include: ['items', 'Payments']}).then(order => {
      return res.render('admin/order', {order})
    })
  },
  putOrder: (req, res) => {
    return Order.findByPk(req.params.id, {}).then(order => {
      order.update({
        ...req.body
      }).then(order => {
        return res.redirect('back')
      })
    })
  },
}

module.exports = productController