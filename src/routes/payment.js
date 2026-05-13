const express = require("express");
const { userAuth } = require("../middlewares/auth");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const { MEMEBER_SHIP_AMOUNT } = require("../constants");
const User = require("../models/user");

const router = express.Router();

router.post("/payment/create", userAuth, async (req, res) => {
  try {
    const membershipType = req.body.membershipType;
    console.log(membershipType);
    const { _id, firstName, lastName, emailId } = req.user;

    const validMemberships = ["silver", "gold"];

    if (!validMemberships.includes(membershipType)) {
      return res.status(400).send({
        message: "Invalid Membership type",
      });
    }

    var options = {
      amount: MEMEBER_SHIP_AMOUNT[membershipType] * 100, // Amount is in currency subunits.
      currency: "INR",
      receipt: "order_rcptid_11",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType,
      },
    };

    console.log(options);
    const order = await razorpayInstance.orders.create(options);

    console.log(order, "000we");
    // save it in my database

    const payment = new Payment({
      userId: _id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
      status: order.status,
    });

    const savedPayment = await payment.save();

    //Return back my order details to frontend

    res.status(200).send({
      data: { payment: savedPayment, keyId: process.env.RAZORPAY_KEY_ID },
    });
  } catch (error) {
    console.log(error, "Err");
    res.status(400).send("Error: " + error);
  }
});

router.post("/payment/webhook", async (req, res) => {
  try {
    // razorpay doc
    // https://razorpay.com/docs/webhooks/validate-test/

    const webhookSignature = req.get("X-Razorpay-Signature");

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      res.status(400).send({ message: "Webhook signature is invalid" });
    }

    // Update my payment status in DB

    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });

    payment.status = paymentDetails.status;

    await payment.save();

    // Update the user as premium

    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();

    // return success response to razorpay

    // if (req.body.event === "payment.failed") {
    // }
    // if (req.body.event === "payment.captured") {
    // }

    return res.status(200).send({ msg: "Webhook received successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
