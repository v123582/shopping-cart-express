require('dotenv').config()

const db = require('../models')
const crypto = require("crypto")
const Order = db.Order
const Cart = db.Cart
const OrderItem = db.OrderItem
const PAGE_LIMIT = 10;
const PAGE_OFFSET = 0;

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_PASSWORD,
  },
});

let URL = process.env.URL

let MerchantID = process.env.MERCHANT_ID
let HashKey = process.env.HASH_KEY
let HashIV = process.env.HASH_IV
let PayGateWay = "https://ccore.spgateway.com/MPG/mpg_gateway"
let ReturnURL = URL+"/spgateway/callback?from=ReturnURL"
let NotifyURL = URL+"/spgateway/callback?from=NotifyURL"
let ClientBackURL = URL+"/orders"

function genDataChain(TradeInfo) {
    let results = [];
    for (let kv of Object.entries(TradeInfo)) {
        results.push(`${kv[0]}=${kv[1]}`);
    }
    return results.join("&");
}

function create_mpg_aes_encrypt(TradeInfo) {
    let encrypt = crypto.createCipheriv("aes256", HashKey, HashIV);
    let enc = encrypt.update(genDataChain(TradeInfo), "utf8", "hex");
    return enc + encrypt.final("hex");
}

function create_mpg_aes_decrypt(TradeInfo) {
    let decrypt = crypto.createDecipheriv("aes256", HashKey, HashIV);
    decrypt.setAutoPadding(false);
    let text = decrypt.update(TradeInfo, "hex", "utf8");
    let plainText = text + decrypt.final("utf8");
    // erase ascii 0-32  都要清掉
    let result = plainText.replace(/[\x00-\x20]+/g, "");
    return result;
}

function create_mpg_sha_encrypt(TradeInfo) {
    
    let sha = crypto.createHash("sha256");
    let plainText = `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`
    
    return sha.update(plainText).digest("hex").toUpperCase();
}

function getTradeInfo(Amt, Desc, email){

  data = {
      'MerchantID': MerchantID, // 商店代號
      'RespondType': 'JSON', // 回傳格式
      'TimeStamp': Date.now(), // 時間戳記
      'Version': 1.5, // 串接程式版本
      'MerchantOrderNo': Date.now(), // 商店訂單編號
      'LoginType': 0, // 智付通會員
      'OrderComment': 'OrderComment', // 商店備註
      'Amt': Amt, // 訂單金額
      'ItemDesc': Desc, // 產品名稱
      'Email': email, // 付款人電子信箱
      'ReturnURL': ReturnURL, // 支付完成返回商店網址
      'NotifyURL': NotifyURL, // 支付通知網址/每期授權結果通知
      'ClientBackURL': ClientBackURL, // 支付取消返回商店網址
  }

  mpg_aes_encrypt = create_mpg_aes_encrypt(data)
  mpg_sha_encrypt = create_mpg_sha_encrypt(mpg_aes_encrypt)

  tradeInfo = {
      'MerchantID': MerchantID, // 商店代號
      'TradeInfo': mpg_aes_encrypt, // 加密後參數
      'TradeSha': mpg_sha_encrypt,
      'Version': 1.5, // 串接程式版本
      'PayGateWay': PayGateWay,
      'MerchantOrderNo': data.MerchantOrderNo,
  }

  return tradeInfo
}

let productController = {
  getOrders: (req, res) => {
    Order.findAll({where: {UserId: req.user.id}, include: 'items'}).then(orders => {

      orders = orders.map(order => ({
        ...order.dataValues, 
        // totalPrice: order.items.map(d => d.price * d.OrderItem.quantity).reduce((a, b) => a+b)
      }))

      return res.render('orders', {orders})
    })
  },
  postOrder: (req, res) => {
    return Cart.findByPk(req.body.cartId, {include: 'items'}).then(cart => {
      return Order.create({
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        shipping_status: req.body.shipping_status,
        payment_status: req.body.payment_status,
        amount: req.body.amount,
        UserId: req.user.id,
      }).then(order => {

        var results = [];
        for (var i = 0; i < cart.items.length; i++) {
            console.log(order.id, cart.items[i].id)
            results.push(
                OrderItem.create({
                  OrderId: order.id,
                  ProductId: cart.items[i].id,
                  price: cart.items[i].price,
                  quantity: cart.items[i].CartItem.quantity,
                })
            );
        }

        var mailOptions = {
          from: process.env.GMAIL_ACCOUNT,
          to: req.user.email,
          subject: 'Sending Email using Node.js',
          text: `${order.id} 訂單成立`,
        };

        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        return Promise.all(results).then(()=>
          res.redirect('/orders')
        );
      })
    })
  },
  cancelOrder: (req, res) => {
    return Order.findByPk(req.params.id, {}).then(order => {
      order.update({
        ...req.body,
        shipping_status: '-1',
        payment_status: '-1',
      }).then(order => {
        return res.redirect('back')
      })
    })
  },
  getPayment: (req, res) => {
    return Order.findByPk(req.params.id, {}).then(order => {
      const tradeInfo = getTradeInfo(order.amount, '產品名稱',  req.user.email)
      order.update({
        ...req.body,
        sn: tradeInfo.MerchantOrderNo,
      }).then(order => {
        return res.render('payment', {tradeInfo})
      })
    })
  },
  spgatewayCallback: (req, res) => {
    const d = JSON.parse(create_mpg_aes_decrypt(req.body.TradeInfo))
    const MerchantOrderNo = d['Result']['MerchantOrderNo']
    console.log(MerchantOrderNo)
    return Order.findAll({where: {sn: MerchantOrderNo}}).then(orders => {
      orders[0].update({
        ...req.body,
        payment_status: 1,
      }).then(order => {
        
        var mailOptions = {
          from: process.env.GMAIL_ACCOUNT,
          to: req.user.email,
          subject: 'Sending Email using Node.js',
          text: `${orders[0].id} 訂單付款成功`,
        };

        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        return res.redirect('/orders')
      })
    })
  }
}

module.exports = productController