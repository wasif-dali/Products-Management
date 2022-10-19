const orderModel = require("../Model/OrderModel")
const userModel = require("../Model/userModel");
const cartModel = require("../Model/cartModel");
const mongoose = require("mongoose")


//-----------------------------------------create Order------------------------------------------------------------------------
const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId.trim()
        let data = req.body
        let { cartId, cancellable } = data
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })

        let userCheck = await userModel.findOne({ _id: userId })
        if (!userCheck) {
            return res.status(404).send({ status: false, message: "user id doesn't exist" })
        }
        if (req.tokenId != userId) return res.status(403).send({ status: false, message: "you are unauthorized" })

        if (!cartId) {
            return res.status(400).send({ status: false, message: "please provide cartId" })
        }
        if (!mongoose.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: 'Please provide valid cartId' })

        let cartCheck = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!cartCheck) {
            return res.status(404).send({ status: false, message: "no cart is created for this user " })
        }
        if (cartCheck.items.length == 0) {
            return res.status(400).send({ status: false, message: "cart is empty" })
        }
        let order = {}
        order.userId = userId
        order.items = []
        let itemLength = cartCheck.items.length
        let totalQuantity = 0
        for (let i = 0; i < itemLength; i++) {
            //need to ask wheather we have to check the productId is present or not
            if (cartCheck.items[i].quantity >= 1) {
                order.items.push(cartCheck.items[i])
                totalQuantity += cartCheck.items[i].quantity

            }
        }
        order.totalPrice = cartCheck.totalPrice
        order.totalItems = cartCheck.totalItems
        order.totalQuantity = totalQuantity
        if (cancellable) {
            if (typeof req.body.cancellable != "boolean") {
                return res.status(400).send({ status: false, message: "cancellable should be boolean" })
            }
        }
        order.cancellable = cancellable

        let status = ["pending"]
        if (req.body.status) {
            if (!status.includes(req.body.status)) {
                return res.status(400).send({ status: false, message: "status should be pending" })
            }
            order.status = req.body.status
        }
      
        let filter = {}
        filter.items = []
        filter.totalItems = 0
        filter.totalPrice = 0
        let cartUpdated = await cartModel.findOneAndUpdate({ _id: cartId }, filter, { new: true })

        let orderCreate = await orderModel.create(order)
        res.status(201).send({ status: true, message: "Success", data: orderCreate })




    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, messgage: err.messgage })
    }
}
module.exports={createOrder}