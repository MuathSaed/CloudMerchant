import { Router } from "express";
import { deleteProduct, deleteProductImage, getLatestProducts, getProducts, getProductDetail, getProductsByCategory, addNewProduct, updateProduct, getAllProducts, adminDeleteProduct } from "src/controllers/product";
import { isAdmin, isAuth } from "src/middleware/auth";
import processFileUpload from "src/middleware/processFileUpload";
import validate from "src/middleware/validate";
import { newProductSchema } from "src/utils/validateSchema";

let productRouter = Router();

productRouter.post("/list", isAuth, processFileUpload, validate(newProductSchema), addNewProduct);
productRouter.patch("/:id", isAuth, processFileUpload, validate(newProductSchema), updateProduct);
productRouter.delete("/:id", isAuth, deleteProduct);
productRouter.delete("/all/:id", isAuth, isAdmin, adminDeleteProduct);
productRouter.delete("/image/:productId/:imageId", isAuth, deleteProductImage);
productRouter.get("/all", isAuth, isAdmin, getAllProducts);
productRouter.get("/detail/:id", getProductDetail);
productRouter.get("/by-category/:category", getProductsByCategory);
productRouter.get("/latest", getLatestProducts);
productRouter.get("/listings", isAuth, getProducts);

export default productRouter;