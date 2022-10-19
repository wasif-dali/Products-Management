const orderModel = require("../Model/OrderModel")
const userModel = require("../Model/userModel");
const cartModel = require("../Model/cartModel");
const validation=require('../validation/validate')
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
        if (req.token.userId != userId) return res.status(403).send({ status: false, message: "you are unauthorized" })

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

         order.status = req.body.status
        

        let orderCreate = await orderModel.create(order)
        await cartModel.findOneAndUpdate({ _id: cartId },{items:[],totalItems:0,totalPrice:0}, { new: true })

   
        res.status(201).send({ status: true, message: "Success", data: orderCreate })




    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, messgage: err.messgage })
    }
}
//---------------------------------------update Prodoct-----------------------------------------------

const updateOrder = async (req, res) => {

    try {

        const userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: 'Please enter valid user ID' });
        }

        const userDoc = await userModel.findById(userId)

        if (userDoc === null) {
            return res.status(404).send({ status: false, message: 'User does not exist in DB' });
        }

        Authorization
        if (req.token.userId !== userId) {
            return res.status(403).send({
                status: false,
                message: `Authorisation failed; You are logged in as ${req.token.userId}, not as ${userId}`
            });
        }

        if (!validation.isValidreqBody(req.body)) {
            return res.status(400).send({ status: false, message: `Invalid Input Parameters` })
        }

        const data =req.body 

        let { orderId, status } = data

        if (!orderId) {
            return res.status(400).send({ status: false, message: `Order Id Should Be Present In RequestBody` })
        }

        if (!validation.isValidElem(orderId)) {
            return res.status(400).send({ status: false, message: 'order Id is required!!!' })
        }

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: 'Please enter valid order Id ' })
        }


        const isOrderExist = await orderModel.findOne({ _id: orderId, isDeleted: false })

        if (!isOrderExist) {
            return res.status(400).send({ status: false, message: `Order not found for this user` })
        }

        if (isOrderExist.userId.toString() !== userId) {
            return res.status(400).send({ status: false, message: `Order does not belong to user` })
        }

        if (!status) {
            return res.status(400).send({ status: false, message: `Status Should Be Present In Request Body` })

        }

        if (status && !["completed", "cancelled"].includes(status)) {
            return res.status(400).send({ status: false, message: `Status can be changed from pending to cancelled or completed only` })
        }

        if (isOrderExist.status == 'completed' || isOrderExist.status == 'cancelled') {
            return res.status(400).send({ status: false, message: `Th order has been ${isOrderExist.status} already` })
        }

        if (isOrderExist.cancellable == false && status == 'cancelled') {
            return res.status(400).send({ status: false, message: `Order can not be cancelled` })
        }

        const updatedData = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })

        return res.status(200).send({ status: true, message: `order updated sucessfully`, data: updatedData })


    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }

}

module.exports = { createOrder,updateOrder }