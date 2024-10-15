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
    
    // Get the logged-in user's account data
    const accountData = res.locals.accountData; // Assuming this is passed via middleware (e.g., after JWT verification)
    const firstName = accountData.account_firstname; // Extract first name
    const accountType = accountData.account_type; // Extract account type (Admin, Employee, Client)
    const accountId = accountData.account_id; // Extract account ID for update link

    // Conditionally pass data to the view
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      loggedin: res.locals.loggedin,
      firstName: firstName,
      accountType: accountType,
      accountId: accountId,
      successMessage: req.flash("success"), 
      errorMessage: req.flash("error")
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Deliver Update Account View
 * *************************************** */
async function buildUpdateAccountView(req, res, next) {
  try {
    let nav = await utilities.getNav();
    
    // Extract account ID from the route parameters
    const accountId = req.params.accountId;

    // Fetch the account data from the database using the accountId
    const accountData = await accountModel.getAccountById(accountId);
    
    // Check if account data exists
    if (!accountData) {
      req.flash("error", "Account not found.");
      return res.redirect("/account/manage");
    }

    // Render the update account view with current account data
    res.render("account/update", {
      title: "Update Account Information",
      nav,
      accountData, // Pass the fetched account data to the view
      errors: null,
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

/* ****************************************
 *  Process Account Update
 * *************************************** */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  // Perform server-side validation here
  const errors = [];
  
  if (!account_firstname || !account_lastname || !account_email) {
      errors.push("All fields are required.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(account_email)) {
      errors.push("Invalid email format.");
  }

  // Check for existing email if necessary (optional)
  const existingEmail = await accountModel.checkExistingEmail(account_email);
  if (existingEmail > 0) {
      errors.push("This email is already in use.");
  }

  // If there are validation errors
  if (errors.length > 0) {
      req.flash("error", errors.join(" "));
      return res.redirect("/account/update"); // Redirect back to the update page
  }

  // If validation passes, proceed with the update
  try {
      await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
      req.flash("success", "Account updated successfully.");
      return res.redirect("/account/manage");
  } catch (error) {
      console.error("Update account error:", error.message);
      req.flash("error", "Failed to update account.");
      return res.redirect("/account/update");
  }
}

/* ****************************************
 *  Process Change Password
 * *************************************** */
async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_id, new_password } = req.body;

  // Validate the password using a separate function
  const validationError = validatePassword(new_password);
  if (validationError) {
      req.flash("error", validationError);
      return res.redirect("/account/update");
  }

  // Hash the password before storing.
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(new_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password update.");
    return res.status(500).redirect("/account/update");
  }

  try {
    const regResult = await accountModel.updatePassword(account_id, hashedPassword);
    
    if (regResult) {
      req.flash("success", `Congratulations, you've updated the password.`);
      return res.redirect("/account/manage");
    } else {
      req.flash("error", "Sorry, the password update failed.");
      return res.redirect("/account/update");
    }
  } catch (error) {
    console.error("Password update error:", error.message);
    req.flash("error", "An error occurred while updating the password.");
    return res.redirect("/account/update");
  }
}

// Password validation function
function validatePassword(password) {
  const minLength = 8; // example criteria
  if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
  }
  // Additional criteria checks can be added here (uppercase, special characters, etc.)
  return null; // No error
}

module.exports = { buildLogin,  buildRegister,  registerAccount, buildAccountManagement, buildUpdateAccountView, accountLogin, updateAccount, changePassword };

