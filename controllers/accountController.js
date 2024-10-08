const utilities = require("../utilities");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    // req.flash("notice", "This is a flash message.!!!@2")
    res.render("account/login", {
      title: "Login",
      errors: null,
      nav,
    });
  }
  
module.exports = { buildLogin }