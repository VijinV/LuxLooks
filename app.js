const express = require("express");
require("dotenv").config();
const app = express();
const path = require("path");
const hbs = require("express-handlebars");
const mongoose = require("mongoose");
const nocache = require("nocache");
const cors = require('cors');

const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
// routes setup
const userRouter = require("./router/userRouter");

const adminRouter = require("./router/adminRouter");

// setting up view engine for user routes

app.use(cors())

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
// setting up user views files
userRouter.set("views", path.join(__dirname, "views/user"));
userRouter.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "userLayout",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/partials",
    helpers:{
      limit:function(ary, max, options) {
        if(!ary || ary.length == 0)
            return options.inverse(this);
    
        var result = [ ];
        for(var i = 0; i < max && i < ary.length; ++i)
            result.push(options.fn(ary[i]));
        return result.join('');
    },
    inc:function(value,options){
      return parseInt(value) + 1
    },
    eq:function(v1, v2) {
      if(v1 == v2) {
        return  v2
      }
      else{
        

      }
    },
    formatNumber:function (num) {
      return num.toLocaleDateString('en-US');
    }, multi:function(val1,val2){
      return val1*val2;
    }


    }
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
    helpers:{
      inc:function(value,options){
        return parseInt(value) + 1
      },limit:function(ary, max, options) {
        if(!ary || ary.length == 0)
            return options.inverse(this);
    
        var result = [ ];
        for(var i = 0; i < max && i < ary.length; ++i)
            result.push(options.fn(ary[i]));
        return result.join('');
    },
    eq:function(v1, v2) {
      if(v1 == v2) {
        return  v2
      }
      else{
        

      }
    },
    formatNumber:function (num) {
      return num.toLocaleDateString('en-US');
    },

    multi:function(val1,val2){
      return val1*val2;
    }

    }
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
 
app.use((err,req, res, next) => {
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
