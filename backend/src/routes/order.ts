import { Router } from "express";
import { confirmPayment, createOrder, getOrderDetail, getOrderHistory, getAllOrders, updateOrderStatus } from "../controllers/order";
import { isAuth } from "../middleware/auth";

let orderRouter = Router();

orderRouter.post("/create", isAuth, createOrder);
orderRouter.post("/confirm", isAuth, confirmPayment);
orderRouter.get("/history", isAuth, getOrderHistory);
orderRouter.get("/all", isAuth, getAllOrders);
orderRouter.get("/:id", isAuth, getOrderDetail);
orderRouter.put('/:id/status', isAuth, updateOrderStatus);

export default orderRouter;