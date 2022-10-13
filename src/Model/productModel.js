const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true
        },

        currencyId: {
            type: String,
            required: true,
            trim: true,
            enum: ["INR"]
        },

        currencyFormat: {
            type: String,
            required: true,
            trim: true,
            enum: ["₹"]
        },

        isFreeShipping: {
            type: Boolean,
            default: false,
            trim: true

        },

        productImage: {
            type: String,
            required: true,
            trim: true
        }, // url link s3

        style: {
            type: String,
            trim: true
        },

        availableSizes: {
            type: [String],
            required: true,
            enum: ["S", "XS", "M", "X", "L", "XL", "XXL",],
            toUpperCase: true,
            trim: true
        },

        installments: {
            type: Number,
            trim: true
        },

        deletedAt: { type: Date },

        isDeleted: { type: Boolean, default: false },

    }, { versionKey: false, timestamps: true });

module.exports = mongoose.model('product', productSchema);



