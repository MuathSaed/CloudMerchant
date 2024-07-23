import { RequestHandler } from "express";
import CartModel from "../models/cart";
import ProductModel from "../models/product";
import OrderModel from "../models/order";
import Stripe from 'stripe';
import UserModel from "src/models/user";

export let stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20', 
});

export let createOrder: RequestHandler = async (req, res) => {
    try {
        let userId = req.user.id;
        let { name, shippingAddress, location, notificationToken, paymentMethodId, paymentMethod } = req.body;

        let user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        if (!user.verified) {
            return res.status(400).send({ error: 'Please verify your email address to place an order.' });
        }


        let cartItems = await CartModel.find({ owner: userId }).populate('product');
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).send({ error: 'Your cart is empty!' });
        }

        let totalAmount = 0;
        for (let item of cartItems) {
            totalAmount += (item.product as any).price * item.quantity; 
        }

        if (paymentMethod === "Cash on Delivery") {
            let newOrder = new OrderModel({
                user: userId,
                items: cartItems.map(item => ({
                    product: item.product,
                    quantity: item.quantity
                })),
                totalAmount,
                shippingAddress: JSON.stringify(shippingAddress),
                location: {
                    longitude: location.longitude,
                    latitude: location.latitude,
                },
                notificationToken: notificationToken as string,
                name,
                paymentMethod,
            });
            await newOrder.save();
    
            for (let item of cartItems) {
                let product = await ProductModel.findById(item.product);
                if (product) {
                    product.quantity -= item.quantity;
                    await product.save();
                }
            }
    
            await CartModel.deleteMany({ owner: userId });
                
                res.status(201).json({ 
                    message: 'Order placed successfully!', 
                    orderId: newOrder._id 
                }); 
        }

        let paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100,
            currency: 'usd',
            payment_method: paymentMethodId,
            automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        });

        res.json({ paymentIntent: paymentIntent.client_secret });  

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).send({ error: 'Error processing your order.' });
    }
};

export let confirmPayment: RequestHandler = async (req, res) => {
    try {
        let userId = req.user.id;
        let { name, shippingAddress, paymentIntentId, location, notificationToken, paymentMethod } = req.body;
        console.log("location", location);
        console.log("notificationToken", notificationToken);
        console.log("name", name);
        let cartItems = await CartModel.find({ owner: userId }).populate('product');
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).send({ error: 'Your cart is empty!' });
        }
        let totalAmount = 0;
        for (let item of cartItems) {
            totalAmount += (item.product as any).price * item.quantity; 
        }

        let paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
        let newOrder = new OrderModel({
            user: userId,
            items: cartItems.map(item => ({
                product: item.product,
                quantity: item.quantity
            })),
            totalAmount,
            shippingAddress: JSON.stringify(shippingAddress),
            location: {
                longitude: location.longitude,
                latitude: location.latitude,
            },
            notificationToken: notificationToken as string,
            name,
            paymentMethod,
            paymentIntentId: paymentIntent.id,
        });
        await newOrder.save();

        for (let item of cartItems) {
            let product = await ProductModel.findById(item.product);
            if (product) {
                product.quantity -= item.quantity;
                await product.save();
            }
        }

        await CartModel.deleteMany({ owner: userId });
            
            res.status(201).json({ 
                message: 'Order placed successfully!', 
                orderId: newOrder._id 
            }); 
        } else {
            return res.status(400).send({ error: 'Payment verification failed.' });
        }
    } catch (error) {
        console.error("Error confirming payment:", error);
        res.status(500).send({ error: 'Error confirming payment.' });
    }
}

export let getOrderHistory: RequestHandler = async (req, res) => {
    try {
        let userId = req.user.id;
        let orders = await OrderModel.find({ user: userId })
                                     .populate('items.product')
                                     .sort('-createdAt');

        let ordersWithDeserializedAddress = orders.map(order => ({
            ...order.toObject(),
            shippingAddress: JSON.parse(order.shippingAddress),
        }));

        res.json({ orders: ordersWithDeserializedAddress });

    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).send({ error: 'Error fetching order history.' });
    }
};

export let getOrderDetail: RequestHandler = async (req, res) => {
    try {
      let orderId = req.params.id; 
      let userId = req.user.id;

      let order = await OrderModel.findOne({ _id: orderId })
        .populate('items.product');
  
      if (!order) {
        return res.status(404).send({ error: 'Order not found.' });
      }

      let orderWithDeserializedAddress = {
        ...order.toObject(),
        shippingAddress: JSON.parse(order.shippingAddress),
      };
  
      res.json({ order: orderWithDeserializedAddress });
    } catch (error) {
      console.error("Error fetching order detail:", error);
        res.status(500).send({ error: 'Error fetching order detail.' });
    }
  };

export let getAllOrders: RequestHandler = async (req, res) => {
    try {
        let orders = await OrderModel.find()
                                     .populate('user', 'name email')
                                     .populate('items.product')
                                     .sort('-createdAt');

        let ordersWithDeserializedAddress = orders.map(order => ({
            ...order.toObject(),
            shippingAddress: JSON.parse(order.shippingAddress),
        }));

        res.json({ orders: ordersWithDeserializedAddress });

    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).send({ error: 'Error fetching all orders.' });
    }
}

export let updateOrderStatus: RequestHandler = async (req, res) => {
    console.log("updateOrderStatus");
    try {
      let orderId = req.params.id;
      let { status } = req.body;

      let validStatuses = ["Pending", "Out to Delivery", "Near You", "Delivered", "Cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).send({ error: 'Invalid order status.' });
      }

      let updatedOrder = await OrderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      ).populate('user', 'name email')
       .populate('items.product');
  
      if (!updatedOrder) {
        return res.status(404).send({ error: 'Order not found.' });
      }
  
      res.json({ 
          message: "Order status updated successfully.", 
          order: updatedOrder 
      });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).send({ error: 'Error updating order status.' });
    }
  };