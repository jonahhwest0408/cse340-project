// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

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

module.exports = router;