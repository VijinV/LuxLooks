const isLogin = (req, res, next) => {
  try {
    if (req.session.admin_id) {
      res.redirect("/admin/dashboard");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = (req, res, next) => {
  try {
    if (req.session.admin_id) {
      next();
    } else {
      const logout = true;
      res.render("login", { logout });
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
