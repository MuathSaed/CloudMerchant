import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import ProductModel from "src/models/product";
import { UserDocument } from "src/models/user";
import {v2, UploadApiResponse} from "cloudinary";

let categories = ["Foodstuffs", "Handicrafts"];
let CLOUD_NAME = process.env.CLOUD_NAME!;
let CLOUD_KEY = process.env.CLOUD_KEY!;
let CLOUD_SECRET = process.env.CLOUD_SECRET!;

v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_SECRET,
  secure: true,
});

let uploadImage = (filePath: string): Promise<UploadApiResponse> => {
  return v2.uploader.upload(filePath, {
    width: 1280,
    height: 720,
    crop: "fill",
  });
};

export let addNewProduct: RequestHandler = async (req, res) => {
  let { name, price, category, description, quantity } = req.body;
  let newProduct = new ProductModel({
    owner: req.user.id,
    name,
    price,
    category,
    description,
    quantity,
  });

  let { images } = req.files;

  if (Array.isArray(images) && images.length > 5) {
    return res.status(422).json({ message: "Image files can not be more than 5!" });
  }

  let invalidFileType = false;

  if (Array.isArray(images)) {
    for (let img of images) {
      if (!img.mimetype?.startsWith("image")) {
        invalidFileType = true;
        break;
      }
    }
  } else {
    if (images) {
      if (!images.mimetype?.startsWith("image")) {
        invalidFileType = true;
      }
    }
  }

  if (invalidFileType)
    return res.status(422).json({ message: "Invalid file type, files must be image type!" });

  if (Array.isArray(images)) {
    let uploadPromise = images.map((file) => uploadImage(file.filepath));
    let uploadResults = await Promise.all(uploadPromise);
    newProduct.images = uploadResults.map(({ secure_url, public_id }) => {
      return { url: secure_url, id: public_id };
    });

    newProduct.thumbnail = newProduct.images[0].url;
  } else {
    if (images) {
      let { secure_url, public_id } = await uploadImage(images.filepath);
      newProduct.images = [{ url: secure_url, id: public_id }];
      newProduct.thumbnail = secure_url;
    }
  }

  await newProduct.save();

  res.status(201).json({ message: "Added new product!" });
};

export let updateProduct: RequestHandler = async (req, res) => {
  let { name, price, category, description, quantity, thumbnail } =
    req.body;
  let productId = req.params.id;
  if (!isValidObjectId(productId))
    return res.status(422).json({ message: "Invalid product id!" });

  let product = await ProductModel.findOneAndUpdate(
    { _id: productId, owner: req.user.id },
    {
      new: true,
    }
  );
  if (!product) return res.status(404).json({ message: "Product not found!" });

  if (typeof thumbnail === "string") product.thumbnail = thumbnail;

  let { images } = req.files;

  if (Array.isArray(images)) {
    let oldImages = product.images?.length || 0;
    if (oldImages + images.length > 5)
      return res.status(422).json({ message: "Image files can not be more than 5!" });
  }

  let invalidFileType = false;

  if (Array.isArray(images)) {
    for (let img of images) {
      if (!img.mimetype?.startsWith("image")) {
        invalidFileType = true;
        break;
      }
    }
  } else {
    if (images) {
      if (!images.mimetype?.startsWith("image")) {
        invalidFileType = true;
      }
    }
  }

  if (invalidFileType)
    return res.status(422).json({ message: "Invalid file type, files must be image type!" });


  if (Array.isArray(images)) {
    let uploadPromise = images.map((file) => uploadImage(file.filepath));
    let uploadResults = await Promise.all(uploadPromise);
    let newImages = uploadResults.map(({ secure_url, public_id }) => {
      return { url: secure_url, id: public_id };
    });

    if (product.images) product.images.push(...newImages);
    else product.images = newImages;
  } else {
    if (images) {
      let { secure_url, public_id } = await uploadImage(images.filepath);
      if (product.images)
        product.images.push({ url: secure_url, id: public_id });
      else product.images = [{ url: secure_url, id: public_id }];
    }
  }

  await product.save();

  res.status(201).json({ message: "Product updated successfully." });
};

export let deleteProduct: RequestHandler = async (req, res) => {
  let productId = req.params.id;
  
  if (!isValidObjectId(productId))
    return res.status(422).json({ message: "Invalid product id!" });
  
  let product = await ProductModel.findOneAndDelete({
    _id: productId,
    owner: req.user.id,
  });

  console.log(productId, req.user.id, product);

  if (!product) return res.status(404).json({ message: "Product not found!" });

  let images = product.images || [];
  if (images.length) {
    let ids = images.map(({ id }) => id);
    await v2.api.delete_resources(ids);
  }

  res.json({ message: "Product removed successfully." });
};

export let deleteProductImage: RequestHandler = async (req, res) => {
  let { productId, imageId } = req.params;
  if (!isValidObjectId(productId))
    return res.status(422).json({ message: "Invalid product id!" });

  let product = await ProductModel.findOneAndUpdate(
    { _id: productId, owner: req.user.id },
    {
      $pull: {
        images: { id: imageId },
      },
    },
    { new: true }
  );

  if (!product) return res.status(404).json({ message: "Product not found!" });

  if (product.thumbnail?.includes(imageId)) {
    let images = product.images;
    if (images) product.thumbnail = images[0].url;
    else product.thumbnail = "";
    await product.save();
  }

  await v2.uploader.destroy(imageId);

  res.json({ message: "Image removed successfully." });
};

export let getProductDetail: RequestHandler = async (req, res) => {
  let { id } = req.params;
  if (!isValidObjectId(id))
    return res.status(422).json({ message: "Invalid product id!" });

  let product = await ProductModel.findById(id).populate<{
    owner: UserDocument;
  }>("owner");
  if (!product) return res.status(404).json({ message: "Product not found!" });

  res.json({
    product: {
      id: product._id,
      name: product.name,
      description: product.description,
      thumbnail: product.thumbnail,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
      image: product.images?.map(({ url }) => url),
      seller: {
        id: product.owner._id,
        name: product.owner.name,
        avatar: product.owner.avatar?.url,
      },
    },
  });
};

export let getProductsByCategory: RequestHandler = async (req, res) => {
  let { category } = req.params;
  let { pageNo = "1", limit = "10" } = req.query as {
    pageNo: string;
    limit: string;
  };
  if (!categories.includes(category))
    return res.status(422).json({ message: "Invalid category!" });

  let products = await ProductModel.find({ category })
    .sort("-createdAt")
    .skip((+pageNo - 1) * +limit)
    .limit(+limit);

  let listings = products.map((p) => {
    return {
      id: p._id,
      name: p.name,
      thumbnail: p.thumbnail,
      category: p.category,
      price: p.price,
    };
  });

  res.json({ products: listings });
};

export let getLatestProducts: RequestHandler = async (req, res) => {
  let products = await ProductModel.find().sort("-createdAt").limit(10);

  let listings = products.map((p) => {
    return {
      id: p._id,
      name: p.name,
      thumbnail: p.thumbnail,
      category: p.category,
      price: p.price,
    };
  });

  res.json({ products: listings });
};

export let getProducts: RequestHandler = async (req, res) => {
  let { pageNo = "1", limit = "10" } = req.query as {
    pageNo: string;
    limit: string;
  };

  let products = await ProductModel.find({ owner: req.user.id })
    .sort("-createdAt")
    .skip((+pageNo - 1) * +limit)
    .limit(+limit);

  let listings = products.map((p) => {
    return {
      id: p._id,
      name: p.name,
      thumbnail: p.thumbnail,
      category: p.category,
      price: p.price,
      image: p.images?.map((i) => i.url),
      quantity: p.quantity,
      description: p.description,
      seller: {
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar,
      },
    };
  });

  res.json({ products: listings });
};

export let getAllProducts: RequestHandler = async (req, res) => {
  let { pageNo = "1", limit = "10" } = req.query as {
    pageNo: string;
    limit: string;
  };

  let products = await ProductModel.find()
    .sort("-createdAt")
    .skip((+pageNo - 1) * +limit)
    .limit(+limit)
    .populate<{ owner: UserDocument }>("owner");

  let listings = products.map((p) => {
    return {
      id: p._id,
      name: p.name,
      thumbnail: p.thumbnail,
      category: p.category,
      price: p.price,
      image: p.images?.map((i) => i.url),
      quantity: p.quantity,
      description: p.description,
      seller: {
        id: p.owner._id,
        name: p.owner.name, 
        avatar: p.owner.avatar?.url, 
      },
    };
  });

  res.json({ products: listings });
};

export let adminDeleteProduct: RequestHandler = async (req, res) => {
  let productId = req.params.id;
  
  if (!isValidObjectId(productId))
    return res.status(422).json({ message: "Invalid product id!" });
  
  let product = await ProductModel.findOneAndDelete({
    _id: productId
  });

  console.log(productId, req.user.id, product);

  if (!product) return res.status(404).json({ message: "Product not found!" });

  let images = product.images || [];
  if (images.length) {
    let ids = images.map(({ id }) => id);
    await v2.api.delete_resources(ids);
  }

  res.json({ message: "Product removed successfully." });
};