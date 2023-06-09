import { Category } from "../models/categoryModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../helpers/errorHandler.js";
import slugify from "slugify";

export const createCategoryController = catchAsyncError(
  async (req, res, next) => {
    const { name } = req.body;

    if (!name)
      return next(new ErrorHandler("Please enter a category name", 400));

    const categoryExist = await Category.findOne({ name });

    if (categoryExist)
      return next(new ErrorHandler("Category already exist", 400));

    const category = await Category.create({ name, slug: slugify(name) });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  }
);

export const updateCategoryController = catchAsyncError(
  async (req, res, next) => {
    const { name } = req.body;
    const { id: _id } = req.params;

    if (!name)
      return next(new ErrorHandler("Please enter all required fields", 400));

    const category = await Category.findByIdAndUpdate(
      _id,
      { name, slug: slugify(name) },
      { new: true }
    );

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  }
);

export const getAllCategoryController = catchAsyncError(
  async (req, res, next) => {
    const categories = await Category.find({});

    res.status(200).json({
      success: true,
      message: "All Category",
      categories,
    });
  }
);


export const getSingleCategoryController = catchAsyncError(async (req, res,next)=>{
    const {slug} = req.params
    const category = await Category.findOne({slug});
    if(!category) return next( new ErrorHandler("Category not found"),401 );
    res.status(200).json({
        success: true,
        category
    })
})

export const deleteCategoryController = catchAsyncError(async(req,res,next)=>{

    const {_id} = req.params
    const category = await Category.findByIdAndDelete({_id});

    res.status(200).json({
        success:true,
        message:"Category deleted successfully"
    })
} )