const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = '<ul id="vehicle-nav">';
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid;
    if (data.length > 0) {
        grid = '<div id="inv-display">'; // Change from <ul> to <div>
        data.forEach(vehicle => {
            grid += '<div class="product-card">'; // Create a card for each vehicle
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + 
                     '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + 
                     ' details" class="card-image"><img src="' + vehicle.inv_thumbnail + 
                     '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + 
                     ' on CSE Motors" /></a>';
            grid += '<div class="card-info">'; // Info section for the vehicle
            grid += '<h2><a href="../../inv/detail/' + vehicle.inv_id + 
                     '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + 
                     ' details">' + vehicle.inv_make + ' ' + vehicle.inv_model + 
                     '</a></h2>';
            grid += '<span class="price">$' + 
                     new Intl.NumberFormat('en-US').format(vehicle.inv_price) + 
                     '</span>';
            grid += '</div>'; // End of card-info
            grid += '</div>'; // End of product-card
        });
        grid += '</div>'; // End of inv-display
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
}

/* **************************************
 * Build the classification view HTML
 ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid;
    if (data.length > 0) {
      grid = '<ul id="inv-display">';
      data.forEach((vehicle) => {
        grid += "<li>";
        grid +=
          '<a href="/inv/vehicle/' + //make sure it points to /inv/vehicle/
          vehicle.inv_id +
          '" title="View ' +
          vehicle.inv_make +
          " " +
          vehicle.inv_model +
          ' details"><img src="' +
          vehicle.inv_thumbnail +
          '" alt="Image of ' +
          vehicle.inv_make +
          " " +
          vehicle.inv_model +
          ' on CSE Motors" /></a>';
        grid += '<div class="namePrice">';
        grid += "<hr />";
        grid += "<h2>";
        grid +=
          '<a href="/inv/vehicle/' + //make sure it points to /inv/vehicle/
          vehicle.inv_id +
          '" title="View ' +
          vehicle.inv_make +
          " " +
          vehicle.inv_model +
          ' details">' +
          vehicle.inv_make +
          " " +
          vehicle.inv_model +
          "</a>";
        grid += "</h2>";
        grid +=
          "<span>$" +
          new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
          "</span>";
        grid += "</div>";
        grid += "</li>";
      });
      grid += "</ul>";
    } else {
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
  };

/* ***************************
 * Build classification dropdown list
 * ************************** */
Util.buildClassificationList = async function(classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => {
  console.log("fn:", fn);  // This will tell you what `fn` is
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /* ****************************************
 *  Check Admin or Employee
 * ************************************ */
 Util.checkAdminOrEmployee = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("error", "Please log in.");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }

        res.locals.accountData = accountData;  // Store user data
        res.locals.loggedin = 1;               // Indicate user is logged in

        // Check if the user has the role of "Employee" or "Admin"
        const accountType = accountData.account_type;
        if (accountType === "Employee" || accountType === "Admin") {
          next();  // Allow access to the admin route
        } else {
          req.flash("error", "You do not have permission to access this resource.");
          res.redirect("/account/login");  // Redirect to login on failure
        }
      }
    );
  } else {
    req.flash("error", "Please log in.");
    res.redirect("/account/login");
  }
};


module.exports = Util