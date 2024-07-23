import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import CartModel from "../models/cart";
import ProductModel from "../models/product";

export let addToCart: RequestHandler = async (req, res) => {
  let { productId, quantity } = req.body;

  if (!isValidObjectId(productId))
    return res.status(422).json({ error: "Invalid product id!" });

  let product = await ProductModel.findById(productId);
  if (!product) return res.status(404).json({ error: "Product not found!" });

  if (product.quantity < quantity)
    return res.status(422).json({ error: "Requested quantity not available!" });

  let cartItem = await CartModel.findOne({
    owner: req.user.id,
    product: productId,
  });

  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    cartItem = new CartModel({
      owner: req.user.id,
      product: productId,
      quantity,
    });
  }

  await cartItem.save();

  res.json({ message: "Product added to cart" });
};

export let getCartItems: RequestHandler = async (req, res) => {
  let cartItems = await CartModel.find({ owner: req.user.id }).populate(
    "product"
  );

  res.json({ cartItems });
};

export let updateCartItem: RequestHandler = async (req, res) => {
  let { itemId } = req.params;
  let { quantity } = req.body;

  if (!isValidObjectId(itemId))
    return res.status(422).json({ error: "Invalid cart item id!" });

  let cartItem = await CartModel.findOne({
    _id: itemId,
    owner: req.user.id,
  }).populate("product");
  if (!cartItem) return res.status(404).json({ error: "Cart item not found!" });

  if ((cartItem.product as any).quantity < quantity) {
    return res.status(422).json({ error: "Requested quantity not available!" });
  }

  cartItem.quantity = quantity;
  await cartItem.save();

  res.json({ message: "Cart item updated" });
};

export let removeFromCart: RequestHandler = async (req, res) => {
  let { itemId } = req.params;

  if (!isValidObjectId(itemId))
    return res.status(422).json({ error: "Invalid cart item id!" });

  let cartItem = await CartModel.findOneAndDelete({
    _id: itemId,
    owner: req.user.id,
  });

  if (!cartItem) return res.status(404).json({ error: "Cart item not found!" });

  res.json({ message: "Product removed from cart" });
};