
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
router.post(
  "/login",
  regValidate.registrationRules(),
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
router.get("/", utilities.handleErrors(accountController.buildAccountManagement));


//Error handling
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = router;