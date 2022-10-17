const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "user",
      require: true,
      unique: true,
    },
    itmes: [
      {
        _id: false,
        product: {
          type: ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    totalItems: {
      type: Number,
      required: true,
    },
  },  
  {
    timestamps: true,
  }
);
mongoose.export = mongoose.model("cart", cartSchema);
