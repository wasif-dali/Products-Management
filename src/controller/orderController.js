const orderModel = require("../Model/OrderModel")
const userModel = require("../Model/userModel");
const cartModel = require("../Model/cartModel");
const mongoose= require("mongoose")


//-----------------------------------------create Order------------------------------------------------------------------------
const createOrder = async function (req, res) {
    try {



    }
    catch(err){
        console.log(err)
        return res.status(500).send({status:false,messgage:err.messgage})
    }
}