import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";
import { User } from "../models/UserModel.js";
import ErrorHandler from "../helpers/errorHandler.js";

export const requireSignIn = catchAsyncError(async (req, res, next) => {
  
  const { token } = req.cookies;
  if (!token)
    return next(new ErrorHandler("Please login to access this page.", 401));
  const decode = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findOne({ _id: decode._id });

  next();
});

export const isAdmin = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;

  if (role !== 1)
    next(
      new ErrorHandler("Unauthorized access, Only admin can access this page"),
      401
    );

  next();
});
