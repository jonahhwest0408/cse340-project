const express = require("express");
const router = new express.Router();

// Route to trigger an intentional error
router.get('/trigger-error', (req, res, next) => {
  const err = new Error("Intentional Server Error");
  err.status = 500;
  next(err); // Pass the error to the middleware
});

// 404 Error Route
router.get('*', (req, res) => {
    res.status(404).render('404', {
        layout: false // Assuming you don't want any layout for this error page
    });
});

module.exports = router;
