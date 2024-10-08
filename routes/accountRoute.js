
// Account Routes Unit 4 deliver login, login view activity
const express = require("express")
const router = new express.Router()

const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

/* ***********************
 * Login View
 *************************/
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/* ***********************
 * Register View
 *************************/
router.get("/registration", utilities.handleErrors(accountController.buildRegister));

/* ***********************
 * Process Registration
 *************************/
router.post('/register', utilities.handleErrors(accountController.registerAccount))

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


module.exports = router;