const {customRole,userMiddleware} = require('../middlewares/user')

const  express = require('express');
const productRouter = express.Router();

const {
    adminnewProduct,
    getProductDetails,
    adminGetProduct,
    getOneProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    addReview,
    deleteReview
} = require('../controllers/productController')


productRouter.route("/get/product").get(getProductDetails)
productRouter.route("/get/product/:id").get(getOneProduct)
productRouter.route("/product/review/:id").post(userMiddleware,addReview)
productRouter.route("/product/review/delete/:id").delete(userMiddleware,deleteReview)


//TODO: ADMIN routes
productRouter.route("/admin/newproduct").post(userMiddleware,customRole('admin'),adminnewProduct);
productRouter.route("/admin/get/product").get(userMiddleware,customRole('admin'),adminGetProduct)
productRouter.route("/admin/update/product/:id").post(userMiddleware,customRole('admin'),adminUpdateProduct)
productRouter.route("/admin/delete/product/:id").delete(userMiddleware,customRole('admin'),adminDeleteProduct)

module.exports = {productRouter}