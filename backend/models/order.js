
import mongoose from "mongoose";
import { randomBytes } from "crypto";

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },

    studentToken: {
  type: String,
  required: true,
  unique: true,
  sparse: true,
  default: () => randomBytes(32).toString("hex"),
},

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      match: /^\d{10}$/,
    },

    room: {
      type: String,
      required: true,
      trim: true,
    },

    roll: {
      type: String,
      required: true,
      trim: true,
    },

    preference: {
      type: String,
      enum: ["Same day", "Inside tomorrow", "Outside"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Received", "Washing", "Ready", "Collected"],
      default: "Received",
    },

    decision: {
      type: String,
      enum: ["Collect now", "Outside", "Inside tomorrow", null],
      default: null,
    },

    amount: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
