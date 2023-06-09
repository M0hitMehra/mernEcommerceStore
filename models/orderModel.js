import mongoose from "mongoose";

const Orders = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.ObjectId, ref: "Product" },
      quantity: {
        type: Number,
      },
    },
  ],
  payment: {},
  buyer: {
    type: mongoose.ObjectId,
    ref: "users",
  },
  status: {
    type: String,
    default: "Not Process",
    enum: ["Not Process", "Processing", "Shipped", "Delivered", "Cancelled"],
  },
}  ,{ timestamps: true }
);

export const Order = mongoose.model("Order", Orders);
