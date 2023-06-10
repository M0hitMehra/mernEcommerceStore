import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import errorMiddleware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import cloudinary from "cloudinary";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import path from "path"
import {fileURLToPath} from "url"

//DOtenv
dotenv.config();

// Connecting to DataBase
connectDB();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());
app.use(express.static(path.join(__dirname,  'client', 'build')))

app.use(cors());

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
})

// Routes
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

app.use("*", function(req,res){
    res.sendFile(path.join(__dirname,'./client/build/index.html'))
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  // console.log(
  //   `Server Running in ${process.env.DEV_MODE} mode on ${PORT}`.bgWhite
  // );
});

app.use(errorMiddleware);
