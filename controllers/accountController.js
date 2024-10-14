const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

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

/* ***********************
 * Register View
 *************************/
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/register", {
        title: "Register",
        errors: null,
        nav,
    });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;
  
    let hashedPassword;
    try {
        // Regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.');
        return res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        });
    }

    try {
      console.log("Attempting to register account...");
  
      const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
      );
  
      if (regResult.rowCount > 0) {
        console.log("Registration successful, redirecting to login...");
        req.flash(
          "notice",
          `Congratulations, you're registered ${account_firstname}. Please log in.`
        );
        return res.status(201).render("account/login", {
          title: "Login",
          nav,
        });
      } else {
        console.log("Registration failed, re-rendering registration page...");
        req.flash("notice", "Sorry, the registration failed.");
        return res.status(501).render("account/register", {
          title: "Registration",
          nav,
        });
      }
    } catch (error) {
      console.error("Registration process error:", error.message); // Log the error
      return res.status(500).render("error", {
        title: "Server Error",
        message: "Something went wrong during registration.",
        nav,
      });
    }
}
  

/* ****************************************
 *  Deliver Account Management View
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav(); 
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      successMessage: req.flash("success"), 
      errorMessage: req.flash("error")      
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

  
module.exports = { buildLogin,  buildRegister,  registerAccount, buildAccountManagement, accountLogin };

