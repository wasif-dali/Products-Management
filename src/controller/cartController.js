const mongoose = require('mongoose')
const cartModel = require("../Model/cartModel")
const productModel = require("../Model/productModel")
const userModel = require("../Model/userModel")
const validation = require("../validation/validate")



//----------------------------------------Create Cart---------------------------------------------------------------------------


const createCart = async (req, res) => {
    try {
        let data = req.body
        let userId = req.params.userId
        //let authorId=req.token.userId
        let createData = {}
        //----------------------------------------userId validation and authorization-----------------------------------------------------
        if (!userId) return res.status(400).send({ status: false, message: "userId is Missing in the Params" })
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please provide valid UserId" })
        let checkUser = await userModel.findById(userId)
        if (!checkUser) return res.status(404).send({ status: false, message: "User Not Found" })
        // if(authorId!=userId) return res.status(403).send({status:false,message:"You are Unauthorized"})
        createData.userId = userId


        //----------------------------------------data(productId ) validation-------------------------------------------------------------
        if (!validation.isValidreqBody(data)) return res.status(400).send({ status: false, message: "please provide data to create cart" })
        if (!data.productId) return res.status(400).send({ status: false, message: "Please provide ProductId" })
        if (!mongoose.isValidObjectId(data.productId)) return res.status(400).send({ status: false, message: "Please provide Valid ProductId" })

        let CheckProduct = await productModel.findById(data.productId)
        if (!CheckProduct) return res.status(404).send({ status: false, message: "Prodoct details not found" })
        if (CheckProduct.isDeleted == true) return res.status(404).send({ status: false, message: "This product is deleted" })
        //----------------------------------------Quantity validation ---------------------------------------------------------------------------


        if (data.quantity || data.quantity == "") {
            if (!validation.isValidNumber(data.quantity)) return res.status(400).send({ status: false, message: "Quantity should be a valid Number" })

        }
        let items = [{
            productId: data.productId,
            quantity: data.quantity || 1
        }]
        createData.totalPrice = CheckProduct.price * (data.quantity || 1)
        createData.totalItems = 1

        createData.items = items
        //-----------------------------------------------cardId validation ----------------------------------------------------------- -----------

        if (data.cartId || data.cartId == "") {
            if (!mongoose.isValidObjectId(data.cartId)) return res.status(400).send({ status: false, message: 'Please provide valid cartId' })
            let cartCheck = await cartModel.findOne({ _id: data.cartId, userId: userId })
            if (!cartCheck) return res.status(404).send({ status: false, message: "no cart found" })
        }

        let findCart = await cartModel.findOne({ userId: userId })

        if (findCart || data.cartId) {
            let newItem = findCart.items

            let list = newItem.map((item) => item.productId.toString())
            if (list.find((item) => item == (data.productId))) {
                let updatedCart = await cartModel.findOneAndUpdate({ userId: userId, "items.productId": data.productId },
                    {
                        $inc: {
                            "items.quantity": data.quantity || 1, totalPrice: createData.totalPrice
                        }
                    }, { new: true }
                )
                return res.status(201).send({ status: true, message: `Success`, data: updatedCart })

            }
            const updateData = await cartModel.findOneAndUpdate(
                { userId: userId },
                { $inc: { totalPrice: createData.totalPrice, totalItems: createData.totalItems }, $push: { items: createData['items'] } },
                { new: true }).select({ __v: 0 })
            return res.status(201).send({ status: true, message: "Success", data: updateData })

        } else {
            const result = await cartModel.create(createData)
            return res.status(201).send({ status: true, message: "Success", data: result })
        }

    } catch (err) {
        return res.status(500).send({ status: false, Message: err.message })
    }
}

module.exports = { createCart }