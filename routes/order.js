// /order/create user
// /order/delete user
// /order/:id user
// /myorders user
//
// /admin/orders admin
// /admin/order/:id admin
// /admin/order/update/:id admin
// /admin/order/delete/:id admin

const {userMiddleware,customRole} = require('../middlewares/user');
const {Router} = require('express')
const {createOrder,deleteOrder,getOneOrder,getMyOrders,adminAllOrders,adminGetOneOrder,adminUpdateOrder,adminDeleteOrder} = require('../controllers/orderController');

const orderRouter = Router();

//TODO: user routes
orderRouter.route("/order/create").post(userMiddleware,createOrder);
orderRouter.route("/order/delete").get(userMiddleware,deleteOrder);
orderRouter.route("/order/:id").get(userMiddleware,getOneOrder);
orderRouter.route("/myorders").get(userMiddleware,getMyOrders);

//TODO: Admin Routes
orderRouter.route("/admin/orders").get(userMiddleware,customRole('admin'),adminAllOrders);
orderRouter.route("/admin/order/:id").get(userMiddleware,customRole('admin'),adminGetOneOrder);
orderRouter.route("/admin/order/update/:id").post(userMiddleware,customRole('admin'),adminUpdateOrder);
orderRouter.route("/admin/order/delete/:id").delete(userMiddleware,customRole('admin'),adminDeleteOrder);

module.exports = {orderRouter}