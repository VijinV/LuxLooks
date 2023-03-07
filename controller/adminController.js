const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const productModel = require("../model/productModel");
const path = require("path");
const multer = require("multer");
const categoryModel = require("../model/categoryModel");
const upload = require("../util/multer");

const orderModel = require("../model/orderModel");


const couponModel = require("../model/couponModel");

// get methods

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

          res.redirect("/admin/dashboard");
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
    const image = req.body.image;
    await productModel
      .findByIdAndUpdate(
        { _id: req.body.ID },
        {
          $set: {
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            image: image.map((x) => x),
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

const loadCategory = async (req, res) => {
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

  console.log(req.query.Id);
  const order = await  orderModel.findByIdAndUpdate(
    { _id: req.query.Id },
    { $set: { status: "Return" } }
    )
    const completeOrder = await order.populate("userId")
    console.log(completeOrder.userId._id);
    const user = await userModel.findOne({_id:completeOrder.userId._id})
    let wallet = user.wallet
    const newWallet = parseInt(wallet+order.price)
    console.log(typeof(newWallet));
    await userModel.findByIdAndUpdate({_id:completeOrder.userId._id},{$set:{
      wallet:newWallet
    }}).then((data)=>console.log(data))  

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

const loadCoupon = async (req, res) => {

const coupon = await couponModel.find({})

  res.render('coupon',{coupon,})

}

const addCoupon = async (req, res) => {

  try {
    
    const coupon =  new couponModel({

      code : req.body.code,
      description : req.body.description,
      discount:req.body.discount,
      expiresAt:req.body.expiresAt,
      isActive : true,
      createdAt:Date.now(),
      updatedAt:Date.now(),
      maxLimit:req.body.maxLimit
      
    })

    console.log(coupon);

    await coupon.save().then(()=>{
      console.log('saved');
      res.redirect('/admin/coupon')
    })

  } catch (error) {


    
  }


}



const loadDashboard = async (req, res) => {
    try {

      adminSession = req.session
      if (adminSession) {
        const productData = await productModel.find()
        const userData = await userModel.find()
        // const adminData = await Admin.findOne()
        const categoryData = await categoryModel.find()
        const orders = await orderModel.find();
  
        const categoryArray = [];
        const orderCount = [];
        for(let key of categoryData){
          categoryArray.push(key.name)
          orderCount.push(0)
      }

      const completeorder = []
      const orderDate =[];
      const orderData =await orderModel.find()
      for(let key of orderData){
        const uppend = await key.populate('products.item.productId')
        orderDate.push(key.createdAt);
        completeorder.push(uppend)
    }
    // console.log(orderDate);
    const orderCountsByDate = {};
    orders.forEach(order => {
      const date = order.createdAt.toDateString();
      if (orderCountsByDate[date]) {
        orderCountsByDate[date]++;
      } else {
        orderCountsByDate[date] = 1;
      }
    });

  const dates = Object.keys(orderCountsByDate);
  const orderCounts = Object.values(orderCountsByDate);
  
    const productName =[];
    const salesCount = [];
    const productNames = await productModel.find();
    for(let key of productNames){
      productName.push(key.name);
      salesCount.push(key.sales)
    }
    for(let i=0;i<completeorder.length;i++){
      for(let j = 0;j<completeorder[i].products.item.length;j++){
         const cataData = completeorder[i].products.item[j].productId.category
         const isExisting = categoryArray.findIndex(category => {
          return category === cataData
         })
         orderCount[isExisting]++
  }}
  
    const showCount = await orderModel.find().count()
    console.log(showCount);
    const productCount = await productModel.count()
    const usersCount = await userModel.count()
    const totalCategory = await categoryModel.count({isAvailable:1})
  
  // console.log(categoryArray);
  // console.log(orderCount);

  
  
      res.render('dashboard', {
        users: userData,
        // admin,
        product: productData,
        category: categoryArray,
        count: orderCounts,
        pname:productName,
        pdate:dates,
        pcount:salesCount,
        showCount,
        productCount,
        usersCount,
        totalCategory
      });
        
    } else {
      res.redirect('/admin/')
    }
  } catch (error) {
    // console.log(error.message)
    console.log(error.message);
  }
}

const salesReport = async (req,res)=>{
 
  
  const products = await productModel.find({})

  let counts

  counts = await orderModel.aggregate([
    { $unwind: '$products.item' },
    { $group: { _id: '$products.item.productId', count: { $sum: 1 } } },
  ]).then(async (result) => {
    const counts = [];
    for (const { _id, count } of result) {
      const product = await productModel.findById(_id)
      counts.push({ productId: _id, count, product });
    }
    return counts;
  });

  res.render("sales", { sale: counts });
  
}
    

module.exports = {
  salesReport,
  addCoupon,
  loadCoupon,
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
