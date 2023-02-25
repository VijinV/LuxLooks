const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const productModel = require("../model/productModel");
const path = require("path");
const multer = require("multer");
const categoryModel = require("../model/categoryModel");
const upload = require("../util/multer");

const orderModel = require("../model/orderModel");

// get methods
loadDashboard = async (req, res) => {
  try {

   await orderModel.find({}).countDocuments((err, count) =>{


    if (err) {

      console.log(err);
      
    } else {
      console.log(count,'countDocuments');
    }


    })

    res.render("dashboard");
  } catch (error) {}
};

const loadProduct = async (req, res) => {
  try {
    productModel.find({}).sort({_id:-1}).exec((err, product) => {
      if (product) {
        res.render("product", { product });
        console.log(product);
      }
    });
    await orderModel.find({}).countDocuments((err, count) =>{
      
      if (err) {
  
        console.log(err);
        
      } else {
        console.log(count,'countDocuments');
      }
  
  
      })
  } catch (error) {
    console.log(error);
  }
};

loadAddProduct = async (req, res) => {
  try {
    categoryModel.find({}).exec((err, category) => {
      res.render("addProduct", { category });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadUsers = (req, res) => {
  const userData = userModel
    .find({})
    .sort({ _id: -1 })
    .exec((err, user) => {
      if (user) {
        res.render("users", { user });
      } else {
        res.render("users");
      }
    });
};

loadLogin = (req, res) => {
  const logout = true;
  res.render("login", { logout });
};

// post meathode

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;

    const userData = await userModel.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        userData.password
      );

      if (passwordMatch) {
        if (userData.isAdmin) {
          req.session.admin_id = userData._id;
          req.session.admin_name = userData.name;

          res.redirect("/admin");
        } else {
          res.render("login", {
            message: "You are not an administrator",
            logout: true,
          });
        }
      } else {
        res.render("login", { message: "password is invalid", logout: true });
      }
    } else {
      res.render("login", { message: "Account not found", logout: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const images = req.files;
    const product = new productModel({
      name: req.body.product,
      category: req.body.category,
      price: req.body.price,
      image: images.map((x) => x.filename),
      description: req.body.description,
      quantity: req.body.qty,
      isAvailable: true,
    });

    await product.save().then(() => console.log("Product Saved"));

    next();
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditProduct = async (req, res) => {
  try {
    const category = await categoryModel.find({});

    const product = await productModel.findById({ _id: req.query.id });

    res.render("editProduct", { product, category });
  } catch (error) {
    console.log(error.message);
  }
};

const editProduct = async (req, res, next) => {
  try {
    // console.log(req.file.filename);

    const image = req.files;

    console.log(image);

    await productModel
      .findByIdAndUpdate(
        { _id: req.body.ID },
        {
          $set: {
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            // image: image.map((x) => x.filename),
            description: req.body.description,
          },
        }
      )
      .then(() => {
        res.redirect("/admin/products");
      });
  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res, next) => {
  const userData = await userModel.findById({ _id: req.query.id });

  if (userData.isAvailable) {
    await userModel.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          isAvailable: false,
        },
      }
    );
  } else {
    await userModel.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          isAvailable: true,
        },
      }
    );
  }
  res.redirect("/admin/users");
};

const inStock = async (req, res) => {
  const product = await productModel.findById({ _id: req.query.id });
  console.log();

  if (product.isAvailable) {
    await productModel.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          isAvailable: false,
        },
      }
    );
  } else {
    await productModel.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          isAvailable: true,
        },
      }
    );
  }

  res.redirect("/admin/products");
};

const addCategory = async (req, res, next) => {
  console.log(req.body.name);

  const category = await categoryModel.findOne({ name: req.body.category });

  if (!category) {
    const category = new categoryModel({
      name: req.body.category,
    });

    await category.save().then((savedCategory) => {
      console.log("category saved successfully");
      console.log(savedCategory);
      res.send(savedCategory);
    });

    // res.writeHead(200, { "Content-Type": "text/html" });
    // res.write(
    //   '<tr><td id="cat"><i class="fab fa-angular fa-lg text-danger me-3"></i> <strong></strong></td><td>hello</td> <td><button class="btn btn-danger"><a style="text-decoration: none; color: #ffff;" href="/admin/deleteCategory?id={{_id}}">Delete</a></button></td></tr>'
    // );
    // res.end();
    // next()
  } else {
    console.log("not found category");

    res.redirect("/admin/category");
  }
};

loadCategory = async (req, res) => {
  categoryModel.find({}).exec((err, category) => {
    if (category) {
      // res.json(category)

      res.render("category", { category });
    } else {
      console.log("no category found");
    }
  });
};

deleteCategory = async (req, res) => {
  await categoryModel.findByIdAndDelete({ _id: req.query.id });

  res.redirect("/admin/category");
};
//! =================================ORDER=========================================================!
const loadOrders = async (req, res) => {
  const order = await orderModel.find({}).sort({ createdAt: -1 });

  if (req.query.id) {
    id = req.query.id;
    console.log(id);
    res.render("order", { order, id: id });
  } else {
    res.render("order", { order });
  }

};

const cancelOrder = async (req, res) => {
  await orderModel.findOneAndUpdate(
    { _id: req.query.id },
    {
      $set: {
        status: "Cancel",
      },
    }
  );
  console.log("cancelled order");
  res.redirect("/admin/order");
};

const ConfirmOrder = async (req, res) => {
  await orderModel.findByIdAndUpdate(
    { _id: req.query.id },
    { $set: { status: "Confirm" } }
  )
  res.redirect('/admin/order')
};

const deliOrder = async (req, res) => {

  await  orderModel.findByIdAndUpdate(
    { _id: req.query.id },
    { $set: { status: "Delivered" } }
  )
  res.redirect('/admin/order')

}

const returnOrder = async (req, res) => {

  await  orderModel.findByIdAndUpdate(
    { _id: req.query.id },
    { $set: { status: "Return" } }
  )
  res.redirect('/admin/order')
}

const viewOrder = async (req, res) => {


  const order = await orderModel.findById({ _id: req.query.Id });

  const completeData = await order.populate("products.item.productId");


  res.render("orderList", {
    order: completeData.products.item,
    session: req.session.user_id,
  });

}

module.exports = {
  viewOrder,
  returnOrder,
  cancelOrder,
  loadOrders,
  deleteCategory,
  inStock,
  blockUser,
  loadDashboard,
  loadProduct,
  loadAddProduct,
  loadUsers,
  loadLogin,
  verifyLogin,
  addProduct,
  editProduct,
  loadEditProduct,
  loadCategory,
  addCategory,
  ConfirmOrder,
  deliOrder,
};
