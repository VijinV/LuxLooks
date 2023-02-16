const express = require("express");
require("dotenv").config();
const app = express();
const path = require("path");
const hbs = require("express-handlebars");
const mongoose = require("mongoose");
const nocache = require("nocache");

const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
// routes setup
const userRouter = require("./router/userRouter");

const adminRouter = require("./router/adminRouter");

// setting up view engine for user routes

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
// setting up user views files
userRouter.set("views", path.join(__dirname, "views/user"));
userRouter.set("view engine", "hbs");
userRouter.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "userLayout",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/partials",
  })
);
// setting up view engine for admin routes
adminRouter.set("views", path.join(__dirname, "views/admin"));
adminRouter.set("view engine", "hbs");
adminRouter.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "adminLayout",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/partials",
  })
);

// setting up static files
userRouter.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/admin")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRouter);
app.use("/admin", adminRouter);

// error handlers

app.use((req, res, next) => {
  res.status(404).render('admin/404.hbs')
})

app.use((ere,req, res, next) => {
  res.status(500).render('admin/404.hbs')
})


// database connection

mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGODB_CONNECT, () =>
  console.log("Database connection established")
);

app.listen("5000", () => {
  console.log("server listening on port 5000");
});
