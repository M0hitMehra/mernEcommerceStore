import { User } from "../models/UserModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../helpers/errorHandler.js";
import { sendToken } from "../helpers/sendToken.js";
import { sendEmail } from "../helpers/sendEmail.js";
import crypto from "crypto";
import { Product } from "../models/productModel.js";
import { Order } from "../models/orderModel.js";

export const registerController = catchAsyncError(async (req, res, next) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password || !phone || !address) {
    return next(new ErrorHandler("Please enter the required fields", 400));
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    return next(new ErrorHandler("User already exists", 404));
  }

  const user = await new User({ name, email, password, phone, address });
  await user.save();

  sendToken(res, user, "Registerd Successfully", 201);
});

export const loginController = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter the required fields", 400));
  }

  const userExist = await User.findOne({ email }).select("+password");
  if (!userExist) {
    return next(
      new ErrorHandler(
        "Invalid password or email, Please login with correct credentials",
        401
      )
    );
  }

  const matchPassword = await userExist.comparePassword(password);

  if (!matchPassword) {
    return next(
      new ErrorHandler(
        "Invalid password or email, Please login with correct credentials",
        401
      )
    );
  }

  sendToken(res, userExist, `Welcome back ${userExist.name}`, 200);
});

export const logoutController = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      // secure:true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req?.user?._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new ErrorHandler("Enter your email !", 202));

  const user = await User.findOne({ email });

  if (!user)
    return next(new ErrorHandler("User not found with this email"), 400);

  const resetToken = await user.getResetToken();
  await user.save();

  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `Click on the link to reset your password ${url}. If you have not requested to reset your password please ignore this message`;

  sendEmail(`M_Store Reset Password`, user.email, message);

  res.status(200).json({
    success: true,
    message: `Reset Password linked successfully sent to ${user.email}`,
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) return next(new ErrorHandler("User not found"), 400);

  user.password = req?.body?.password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Password changed successfully`,
  });
});

export const updateProfileController = catchAsyncError(
  async (req, res, next) => {
    const { name, password, address, email, phone } = req.body;

    const user = await User.findOne({ email }, { new: true }).select(
      "-password"
    );

    if (!user) return next(new ErrorHandler("User not found"), 400);

    user.name = name;
    user.address = address;
    user.phone = phone;
    if (password) {
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile upadted successfully",
      user,
    });
  }
);

export const getAllProductsAnsUsersController = catchAsyncError(
  async (req, res, next) => {
    const users = await User.find();
    const products = await Product.find();
    const orders = await Order.find().populate("products.productId").populate("buyer");  ;

    res.status(200).json({
      success: true,
      users,
      products,
      orders,
    });
  }
);
