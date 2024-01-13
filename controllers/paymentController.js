const bigPromise = require('../middlewares/bigPromise');
const Razorpay = require("razorpay");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const captureStripePayment = async (request,response,next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: request.body.amount,
        currency: 'inr',

        //optionals, but in use
        metadata: {integration_check: 'accept_a_payment'}
    })

    response.status(200).json({
        success: true,
        amount:request.body.amount,
        paymentIntent: paymentIntent
    })
}

const getStripeKey = (request,response,next) => {
    response.status(200).json({
        success: true,
        key: process.env.STRIPE_API_KEY
    })
}

const captureRazorpayPayment = async (request,response,next) => {
    const instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_SECRET_KEY })

    const orderOptions = {
        amount: request.body.amount,
        currency: "INR",
    }

    const myOrder = await instance.orders.create(orderOptions);

    response.status(201).json({
        success: true,
        amount:request.body.amount,
        order: myOrder
    })
}

const getRazorpayKey = (request,response,next) => {
    response.status(200).json({
        success: true,
        key: process.env.RAZORPAY_API_KEY
    })
}

exports.getStripeKey = bigPromise(getStripeKey);
exports.getRazorpayKey = bigPromise(getRazorpayKey);
exports.captureStripePayment = bigPromise(captureStripePayment);
exports.captureRazorpayPayment = bigPromise(captureRazorpayPayment);