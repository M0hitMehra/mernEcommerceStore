import express from "express";
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import {createCategoryController, deleteCategoryController, getAllCategoryController, getSingleCategoryController, updateCategoryController} from "../controllers/categoryController.js";


const router = express.Router();

// create category
router.post('/create-category',  requireSignIn , isAdmin , createCategoryController )

// update category
router.put('/update-category/:id', requireSignIn ,isAdmin , updateCategoryController)

// get all categories
router.get('/categories',  getAllCategoryController)

//get single category
router.get('/single-category/:slug', getSingleCategoryController)
router.delete('/delete-category/:_id',requireSignIn ,isAdmin, deleteCategoryController)

export default router