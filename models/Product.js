const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'please provide name of product'],
        trim: true,
        maxLength: [220,'product name cannot exceed 220 characters']
    },

    price: {
        type: Number,
        required: [true,'please provide price of product'],
        maxLength: [5,'product price should not be more than 5 digits']
    },

    description: {
        type: String,
        required: [true,'please provide description of product'],
    },

    photos: [
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],

    category: {
        type: String,
        required: [true,'please select category from : fullsleeves, halfsleeves, hoodies and collarless'],
        enum: {
            values: [
                "nothing",
                "sleeves",
                "halfsleeves",
                "hoodies",
                "collarless"
            ],
            message: 'please select category ONLY from: full-sleeves, half-sleeves, hoodies and collarless '
        }
    },

    brand: {
        type: String,
        required: [true,'please define brand of the product']
    },

    stock: {
        type: Number,
        required: [true,'define appropriate stock for product']
    },

    rating: {
        type: Number,
        default: 0
    },

    numberOfReview: {
        type: Number,
        enum: {
            values: [
                1,2,3,4,5
            ],
            message: 'provide rating out of 5 only'
        }
    },

    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },

            name: {
                type: String,
                required: true
            },
            
            rating: {
                type: Number,
                required: true
            },

            comment: {
                type: String,
                required: true
            }
        }
    ],

    user: { // the one who added this product can be manager,admin and etc
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})



module.exports = mongoose.model('Product',productSchema)