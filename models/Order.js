const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderItems: [
        {
            name: {
                type: String,
                required: [true,'please provide order item name']
            },

            quantity: {
                type: Number,
                required: [true,'please provide order item Quantity']
            },

            coverImage: {
                type: String,
                required: [true,'please provide order item image']
            },

            price: {
                type: Number,
                required: [true,'please provide order item price']
            },

            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: [true,'please provide product model']
            }
        }
    ],

    shippingInfo: {
        address: {
            type: String,
            required: [true,'please provide shipping address']
        },

        postalCode: {
            type: Number,
            required: [true,'please provide shipping  postal code']
        },

        city: {
            type: String,
            required: [true,'please provide shipping city']
        },

        country: {
            type: String,
            required: [true,'please provide shipping country']
        },

        phoneNo:{
            type: Number,
            required: [true,'please provide contact no while used in order Shipping']
        }
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },

    shippingAmount: {
        type: Number,
        required: [true,'please provide shipping amount']
    },

    paymentInfo: {
        paymentMethod: {
            type: String,
            required: true,
            enum: {
                values: ["card","upi","net banking"]
            },
            message: 'please select methods only from Card, UPI and Net banking'
        },
        id: {
            type: String,
            required: true
        }
    },

    taxAmount: {
        type: Number,
        required: [true,'please provide tax amount for product to be shipped']
    },

    totalAmount: {
        type: Number,
        required: [true,'please provide total amount for product to buyed']
    },

    orderStatus: {
        type: String,
        required: [true,'please define current status for product'],
    },

    deliveredAt: {
        type: Date
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("order",orderSchema);