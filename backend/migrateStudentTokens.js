
import dotenv from "dotenv";
import mongoose from "mongoose";
import { randomBytes } from "crypto";
import Order from "./models/order.js";

dotenv.config();

async function migrateTokens() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const orders = await Order.find({
      $or: [
        { studentToken: { $exists: false } },
        { studentToken: null },
      ],
    });

    for (const order of orders) {
      order.studentToken = randomBytes(32).toString("hex");
      await order.save();
    }

    console.log(`Updated ${orders.length} existing orders.`);
  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

migrateTokens();
