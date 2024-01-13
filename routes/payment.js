const express = require('express');
const paymentRouter = express.Router();

const {userMiddleware} = require('../middlewares/user')

const {
    getRazorpayKey,
    getStripeKey,
    captureRazorpayPayment,
    captureStripePayment
}  = require('../controllers/paymentController');


paymentRouter.route("/getrazorpaykey").get(userMiddleware,getRazorpayKey);
paymentRouter.route("/getstripekey").get(userMiddleware,getStripeKey);

paymentRouter.route("/capturerazorpay").post(userMiddleware,captureRazorpayPayment);
paymentRouter.route("/capturestripe").post(userMiddleware,captureStripePayment);


module.exports = {paymentRouter}