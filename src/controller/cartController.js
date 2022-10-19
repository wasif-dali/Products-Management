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
        // let authorId=req.token.userId
        let createData = {}
        //----------------------------------------userId validation and authorization-----------------------------------------------------
        if (!userId) return res.status(400).send({ status: false, message: "userId is Missing in the Params" })
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please provide valid UserId" })
        let checkUser = await userModel.findById(userId)
        if (!checkUser) return res.status(404).send({ status: false, message: "User Not Found" })
        //  if(authorId!=userId) return res.status(403).send({status:false,message:"You are Unauthorized"})
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
                            "items.$.quantity": data.quantity || 1, totalPrice: createData.totalPrice
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
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
};
//-------------------------------------------------------get cart-----------------------------------------------------------------
const getCart = async function (req, res) {
    try {
      let  userId = req.params.userId
        if (!userId) return res.status(400).send({ status: false, message: 'Please provide userId' })
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        //checking if the cart exist with this userId or not
        let userCheck = await userModel.findById(userId)
        if (!userCheck) return res.status(404).send({ status: false, message: "no user found" })
        if (req.token.userId != userId) return res.status(403).send({ status: false, message: "you are unauthorized" })

        let findCart = await cartModel.findOne({ userId: userId }).populate('items.productId').select({ __v: 0 });
        if (!findCart) return res.status(404).send({ status: false, message: `No cart found with this "${userId}" userId` });

        res.status(200).send({ status: true, message: "Cart Details", data: findCart })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

//----------------------------------------------------------------delete Cart-------------------------------------------------
const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId;

        //--------------------------- ---------------------Validation Starts-------------------------------------//
        // validating userid from params
        if (!validation.isValidElem(userId)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. userId is required" });
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. userId is not valid" });
        }

        let Userdata = await userModel.findOne({ _id: userId })
        if (!Userdata) {
            return res.status(404).send({ status: false, msg: "No such user exists with this userID" });
        }
        if (req.token.userId != userId) return res.status(403).send({ status: false, message: "you are unauthorized" })


        let usercart = await cartModel.findOne({ userId: userId })
        if (!usercart) {
            return res.status(404).send({ status: false, msg: "there is No such cart of this user" });
        }
        let updatedUserCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
        return res.status(204).send({ status: true, message: " cart deleted successfully" })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
};
// update

const updateCart =async (req,res) =>{
  try {
      let userId = req.params.userId;
      let data = req.body;
      let { productId, cartId, removeProduct } = data;
  
      if (!validation.isValidreqBody(data))
        return res.status(400).send({ status: false, message: "please enter data to update" });
  
      if (!mongoose.isValidObjectId(userId))
        return res.status(400).send({ status: false, message: "please enter valid user id" });
      let user = await userModel.findOne({ _id: userId });
      if (!user)
        return res.status(404).send({ status: false, message: "no such user found" });
  
      //Authorisation
      let tokenUserId = req.userId;
      if (userId != tokenUserId) {
        return res.status(403).send({ status: false, message: "UnAuthorized Access!!" });
      }
  
      if (!mongoose.isValidObjectId(productId))
        return res.status(400).send({ status: false, message: "please enter valid product id" });
      let findProduct = await productModel.findOne({_id: productId,isDeleted: false,});
      if (!findProduct)
        return res
          .status(404)
          .send({ status: false, message: "product not found" });
  
      if (!mongoose.isValidObjectId(cartId))
        return res
          .status(400)
          .send({ status: false, message: "please enter valid cart Id" });
      let findCart = await cartModel.findOne({ _id: cartId, userId });
      if (!findCart)
        return res.status(404).send({ status: false, message: "cart not found" });
  
      if (!(removeProduct == 0 || removeProduct == 1))
        return res
          .status(400)
          .send({
            status: true,
            message: "removeProduct value should be either 1 or 0",
          });
  
      let itemsOfCart = findCart.items;
      if (itemsOfCart.length == 0)
        return res
          .status(400)
          .send({ status: false, message: "cart is already empty" });
  
      for (let i = 0; i < itemsOfCart.length; i++) {
        if (itemsOfCart[i].productId == productId) {
          let priceChange = itemsOfCart[i].quantity * findProduct.price;
  
          if (removeProduct == 0) {
            const update = await cartModel.findOneAndUpdate(
              { _id: cartId },
              {
                $pull: { items: { productId: productId } },
                totalPrice: findCart.totalPrice - priceChange,
                totalItems: findCart.totalItems - 1,
              },
              { new: true }
            );
            return res
              .status(200)
              .send({
                status: true,
                message: "Remove product Successfully",
                data: update,
              });
          }
  
          if (removeProduct == 1) {
            if (itemsOfCart[i].quantity == 1) {
              const update = await cartModel.findOneAndUpdate(
                { _id: cartId },
                {
                  $pull: { items: { productId: productId } },
                  totalPrice: findCart.totalPrice - priceChange,
                  totalItems: findCart.totalItems - 1,
                },
                { new: true }
              );
              return res
                .status(200)
                .send({
                  status: true,
                  message: "Remove product Successfully & price updated",
                  data: update,
                });
            }
  
            itemsOfCart[i].quantity = itemsOfCart[i].quantity - 1;
            const update = await cartModel.findOneAndUpdate(
              { _id: cartId },
              {
                items: itemsOfCart,
                totalPrice: findCart.totalPrice - findProduct.price,
              },
              { new: true }
            );
            return res
              .status(201)
              .send({
                status: true,
                message: "One item removed successfully",
                data: update,
              });
          }
        } else {
          return res
            .status(404)
            .send({
              status: false,
              message: "please add the item in the cart first and then update",
            });
        }
      }
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  };
  

module.exports = { createCart, getCart, deleteCart,updateCart }