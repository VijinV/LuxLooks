const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const productModel = require("../model/productModel");
const path = require("path");
const multer = require("multer");
const categoryModel = require("../model/categoryModel");
const upload = require('../util/multer')



// get meathodes
loadDashboard = (req, res) => {
 try {

  
   res.render("dashboard");
 } catch (error) {

 }
};



loadProduct = async (req, res) => {
  const productData = await productModel.find({}).exec((err, product) => {
    if (product) {
      res.render("product", { product });
    } else {
      res.send("404 page not found");
    }
  });
};

loadAddProduct = async (req, res) => {
  
try {
	  categoryModel.find({}).exec((err, category) => {
        res.render("addProduct",{category});
      })
	  
} catch (error) {

    console.log(error.message);
	
}
};

const loadUsers = (req, res) => {
  const userData = userModel.find({}).sort({_id:-1}).exec((err, user) => {
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
    const images = req.files
    const product = new productModel({
      name: req.body.product,
      category: req.body.category,
      price: req.body.price,
      image: images.map((x) => x.filename),
      description: req.body.description,
      quantity:req.body.qty,
      isAvailable: true,
    });

    await product.save().then(() => console.log("Product Saved"));

    next();
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditProduct = (req, res) => {
  try {
    productModel.findById({ _id: req.query.id }).exec((err, product) => {
      if (product) {
        res.render("editProduct", { product });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const editProduct = async (req, res, next) => {
  try {

    console.log(req.file.filename);

    await productModel
      .findByIdAndUpdate(
        { _id: req.body.ID },
        {
          $set: {
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            image:req.file.filename,
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


const addCategory = async (req, res,next) => {

  console.log(req.body.name);

  const category = await categoryModel.findOne({name: req.body.name});

if (!category) {
	    const category = new categoryModel({
	        name : req.body.name
	    })
	 
	    await category.save().then(()=>{console.log('category saved successfully')})
	
	    next()
} else {

  console.log('not found category');

    res.redirect('/admin/category')
	
}

}

loadCategory = async (req, res) => {
    categoryModel.find({}).exec((err, category) =>{

    if(category){
      // res.json(category)

        res.render('category', {category})
    }else{

        console.log('no category found');

    }
    
 })
}

deleteCategory = async (req, res) => {
    
    await categoryModel.findByIdAndDelete({_id: req.query.id});

    res.redirect('/admin/category');


}





module.exports = {
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
  addCategory
};
