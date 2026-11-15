
import express from "express";
import Order from "../models/order.js";

const router = express.Router();

// GET all orders (admin)
router.get("/", async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { room: { $regex: search, $options: "i" } },
        { roll: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE new order
router.post("/", async (req, res) => {
  try {
    const { name, phone, room, roll, preference } = req.body;

    if (!name || !phone || !room || !roll || !preference) {
      return res.status(400).json({
        success: false,
        message: "All student details are required.",
      });
    }

    const order = await Order.create({
      id: `LM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      phone,
      room,
      roll,
      preference,
      amount: 10,
    });

    res.status(201).json({
      success: true,
      message: "Laundry order registered successfully.",
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// STUDENT: Get order using secure token
router.get("/student/:token", async (req, res) => {
  try {
    const order = await Order.findOne({
      studentToken: req.params.token,
    }).select("id name room status decision createdAt");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired laundry link.",
      });
    }

    if (!["Ready", "Collected"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Your laundry is not ready yet.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// STUDENT: Submit collection decision using secure token
router.patch("/student/:token/decision", async (req, res) => {
  try {
    const { decision } = req.body;

    const allowedDecisions = [
      "Collect now",
      "Outside",
      "Inside tomorrow",
    ];

    if (!allowedDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collection decision.",
      });
    }

    const order = await Order.findOne({
      studentToken: req.params.token,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired laundry link.",
      });
    }

    if (order.status !== "Ready") {
      return res.status(400).json({
        success: false,
        message: "Collection decisions are available only when laundry is ready.",
      });
    }

    if (order.status === "Collected") {
      return res.status(400).json({
        success: false,
        message: "This laundry order has already been collected.",
      });
    }

    order.decision = decision;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Your collection preference has been saved.",
      order: {
        id: order.id,
        name: order.name,
        status: order.status,
        decision: order.decision,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN: Update laundry status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Received",
      "Washing",
      "Ready",
      "Collected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid laundry status.",
      });
    }

    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN: Update collection decision
router.patch("/:id/decision", async (req, res) => {
  try {
    const { decision } = req.body;

    const allowedDecisions = [
      "Collect now",
      "Outside",
      "Inside tomorrow",
      null,
    ];

    if (!allowedDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collection decision.",
      });
    }

    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { decision },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Collection decision updated.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
