
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

/* ***********************
 * Register View
 *************************/
router.get("/registration", utilities.handleErrors(accountController.buildRegister));

/* ***********************
 * Account Management View (after login)
 *************************/
router.get("/", utilities.handleErrors(accountController.buildAccountManagement));

/* ***********************
 * Process Registration
 *************************/
// Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

//Error handling
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Process the login attempt
router.post(
  "/login",
  regValidate.registrationRules(),
  regValidate.checkLoginData,
  accountController.accountLogin  // Removed utilities.handleErrors
)

module.exports = router;