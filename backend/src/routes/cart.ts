import { Router } from "express";
import { addToCart, getCartItems, updateCartItem, removeFromCart} from "../controllers/cart";
import { isAuth } from "../middleware/auth";

let cartRouter = Router();

cartRouter.get("/", isAuth, getCartItems);
cartRouter.post("/add", isAuth, addToCart);
cartRouter.patch("/update/:itemId", isAuth, updateCartItem);
cartRouter.delete("/remove/:itemId", isAuth, removeFromCart);

export default cartRouter;