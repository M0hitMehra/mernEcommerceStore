 import express from 'express';
import { forgetPassword, getAllProductsAnsUsersController, getMyProfile, loginController, logoutController, registerController, resetPassword, updateProfileController } from '../controllers/userController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';

 const router = express.Router()

//  Register routes
 router.post('/register',registerController)

 //login routes
 router.post('/login', loginController)

 router.get('/logout', logoutController)

router.get('/me' ,requireSignIn , getMyProfile)

router.post('/forgetpassword', forgetPassword)

router.put('/resetpassword/:token',resetPassword)

router.put('/updateprofile',requireSignIn,updateProfileController)

router.get('/productsandusers',requireSignIn , isAdmin ,getAllProductsAnsUsersController)




 export default router