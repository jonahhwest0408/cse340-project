// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to display a specific vehicle's detail
router.get("/vehicle/:vehicleId", invController.getVehicleDetail);

// Route to trigger an intentional error
router.get('/trigger-error', (req, res, next) => {
    const err = new Error("Intentional Server Error");
    err.status = 500;
    next(err); // Pass the error to the next middleware (error handler)
  });

/* ***********************
 * Management View
 *************************/
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to render add-classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassificationView));

// Route to handle form submission
router.post("/add-classification", utilities.handleErrors(invController.addClassification));

// Route to render the Add Inventory form
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventoryView));

// Route to handle adding the inventory item
router.post('/add-inventory', utilities.handleErrors(invController.addInventory));

module.exports = router;