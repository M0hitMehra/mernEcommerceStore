import slugify from "slugify";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Product } from "../models/productModel.js";
import cloudinary from "cloudinary";
import getDataUri from "../helpers/dataUri.js";
import ErrorHandler from "../helpers/errorHandler.js";
import Apifeatures from "../helpers/apiFeatures.js";
import braintree from "braintree";
import dotenv from "dotenv";
import { Order } from "../models/orderModel.js";

dotenv.config();

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = catchAsyncError(
  async (req, res, next) => {
    let images = [];

    const duplicate = await Product.findOne({ slug: slugify(req.body.name) });
    if (duplicate && slugify(req.body.name.trim()) === duplicate.slug.trim()) {
      return next(new ErrorHandler("Duplicate Products", 400));
    }

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products2023",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    const product = await Product.create({
      ...req.body,
      slug: slugify(req.body.name),
    });
    res.status(201).json({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  }
);

export const updateProductController = catchAsyncError(
  async (req, res, next) => {
    let product = await Product.findById(req.params._id);

    if (!product) {
      return next(new ErrorHandler("Product not found"), 404);
    }

    //Images STart here
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    if (images !== undefined) {
      //DELEtING images from CLoudinary
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id, {
          folder: "products2023",
        });
      }

      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products2023",
        });

        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      req.body.images = imagesLinks;
    }

    product = await Product.findByIdAndUpdate(
      req.params._id,
      { ...req.body, slug: slugify(req.body.name) },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(201).json({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  }
);

export const getProductController = catchAsyncError(async (req, res, next) => {
  const resultPage = 9;
  const productsCount = await Product.countDocuments();


  const apifeatures = new Apifeatures(
    Product.find().populate("category").sort({ createdAt: -1 }),
    req.query
  )
    .search()
    .filter();

  let products = await apifeatures.query;

  let filteredProductsCount = products.length;

  apifeatures.pagination(resultPage);

  products = await apifeatures.query.clone();

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPage,
    filteredProductsCount,
  });
});

export const getSingleProductController = catchAsyncError(
  async (req, res, next) => {
    const { slug } = req.params;

    const product = await Product.findOne({ slug }).populate("category");

    res.status(200).json({
      success: true,
      message: "Getting single Product",
      product,
    });
  }
);

export const deleteProductController = catchAsyncError(
  async (req, res, next) => {
    const { _id } = req.params;

    const productFind = await Product.findById(_id);

    if (!productFind) {
      return next(new ErrorHandler("Product not found", 404));
    }
    let imagesArray = productFind.images;

    imagesArray.map(async (image) => {
      await cloudinary.v2.uploader.destroy(image.public_id);
    });

    const product = await Product.findByIdAndDelete(_id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  }
);

export const relatedProductController = catchAsyncError(
  async (req, res, next) => {
    const { c_id, pid } = req.params;
    const relatedProducts = await Product.find({
      category: c_id,
      _id: { $ne: pid },
    })
      .limit(5)
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Related Products",
      relatedProducts,
    });
  }
);

export const brainTreeTokenController = catchAsyncError(
  async (req, res, next) => {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        return next(new ErrorHandler(err, 501));
      } else {
        res.status(200).json({
          clientToken: response.clientToken,
        });
      }
    });
  }
);

export const brainTreePaymentController = catchAsyncError(
  async (req, res, next) => {
    let { cart, nonce } = req.body;
    let total = 0;
    cart &&
      cart.map((item) => {
        total += item.price * item.quantity;
      });

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      async function (error, result) {
        if (result) {
          let cartIds = [];
          cart.map((item) => {
            cartIds.push({productId: item.product ,quantity: item.quantity});
          });
          cart = cartIds;
           const order = await new Order({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.status(200).json({
            success: true,
            message: "Order placed successfully",
            order,
          });
        }
        if (error) {
          return next(new ErrorHandler(error, 400));
        }
      }
    );
  }
);

export const getOrdersController = catchAsyncError(
  async (req, res, next) => {
    const orders = await Order.find({buyer: req.user._id}).populate("products.productId").populate("buyer");  
    
    if(!orders) next (new ErrorHandler("Orders not found ",302) )
    res.status(200).json({
        success: true,
        orders  
    })
  }
);


export const changeOrderStatusController = catchAsyncError(async(req,res,next)=>{
    const {_id} = req.params
    const {status} = req.body
     const order  =await Order.findOne({_id})
    if(!order) return next(new ErrorHandler("Order not found"),404)
    order.status = status
    await order.save()
    res.status(200).json({
      success :true,
      message :`Order status changed to ${status}`
    })
}  )