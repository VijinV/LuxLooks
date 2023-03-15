const userModel = require("../model/userModel");

const isLogin = async (req, res, next) => {
  try {
    if(req.session.user_id){

      const user =await userModel.findById({_id:req.session.user_id}) 
      if (req.session.admin_id && user.isAvailable) {
        res.redirect("/admin/dashboard");
      } else {
        next();
      }
    }
   
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {

    if(req.session.user_id){
      const user = await userModel.findById({_id:req.session.user_id})

      if (req.session.admin_id && user.isAvailable) {
        next();
      } else {
        const logout = true;
        res.render("login", { logout });
      }


    }

   
  } catch (error) {
    console.log(error.message);
  }
};

const logout = (req, res) => {
  try {
    req.session.admin_id = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
  logout,
};
