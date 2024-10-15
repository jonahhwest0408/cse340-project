
// Account Routes Unit 4 deliver login, login view activity
const express = require("express");
const router = new express.Router();

const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

/* ***********************
 * Login View
 *************************/
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// Process the login attempt
// router.post("/login", utilities.handleErrors(accountController.accountLogin));

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)
/* ***********************
 * Register View
 *************************/
router.get("/registration", utilities.handleErrors(accountController.buildRegister));
/* ***********************
 * Process Registration
 *************************/
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

/* ***********************
 * Account Management View (after login)
 *************************/
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Route for rendering account management
router.get("/manage", accountController.buildAccountManagement);

// Route for updating account information
router.get("/update/:accountId", accountController.buildUpdateAccountView);
// Route for updating account information
router.post(
  "/update",
  regValidate.accountUpdateRules(),  // Use account update validation rules
  regValidate.checkRegData,           // Check account update data
  utilities.handleErrors(accountController.updateAccount)  // Handle account update logic
);

// Route for changing the password
router.post(
  "/change-password",
  regValidate.passwordUpdateRules(),  // Use password update validation rules
  regValidate.checkLoginData,          // Check password update data
  utilities.handleErrors(accountController.changePassword)  // Handle password change logic
);


/* ***********************
 * Logout
 *************************/
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/account/login");
});

//Error handling
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = router;