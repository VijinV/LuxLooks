const isLogin = (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect('/')
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = (req, res, next) => {
  try {
    if (req.session.user_id) {
      next();
    } else {
      res.render("login",{login:true,});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const logout = (req, res) => {
  try {
    req.session.user_id = null
    res.redirect("/"); 
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
  logout,
};
