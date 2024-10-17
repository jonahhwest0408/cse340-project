const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Get vehicle details by vehicleId
 * ************************** */
invCont.getVehicleDetail = async function (req, res, next) {
    const vehicleId = req.params.vehicleId; //fetch vehicleId from route
    const vehicleData = await invModel.getVehicleById(vehicleId); //query DB for vehicle details
    let nav = await utilities.getNav();
  
    if (vehicleData) {
      res.render("./inventory/vehicleDetail", {
        title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
        nav,
        vehicleData, 
      });
    } else {
      res.status(404).send("Vehicle not found");
    }
  };

/* ***************************
 *  Build management view for inventory
 * ************************** */
invCont.buildManagement = async function(req, res, next) {
  try {
    let nav = await utilities.getNav(); 
    const classificationResult = await invModel.getClassifications();
    const classifications = classificationResult.rows; 

    // Call your inventory items retrieval function, making sure to adjust based on your needs
    const inventoryItems = await invModel.getInventoryByClassificationId();

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classifications,
      inventoryItems,
      errors: null,
      messages: req.flash("info") 
    });
  } catch (error) {
    console.error("Error in buildManagement:", error);
    req.flash("error", "An error occurred while fetching data.");
    res.redirect("/some-error-page"); 
  }
};

/* ***************************
 *  Render Add Classification Form
 * ************************** */
invCont.buildAddClassificationView = async function(req, res, next) {
  let nav = await utilities.getNav(); // Fetch navigation
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    messages: req.flash("info"),
  });
};

/* ***************************
 *  Process Add Classification Form
 * ************************** */
invCont.addClassification = async function(req, res, next) {
  const { classificationName } = req.body;

  // Server-side validation: no spaces or special characters allowed
  const nameRegex = /^[a-zA-Z0-9]+$/;
  if (!nameRegex.test(classificationName)) {
    req.flash("error", "Classification name cannot contain spaces or special characters.");
    return res.redirect("/inv/add-classification");
  }

  try {
    // Call the model function to insert the classification
    const result = await invModel.insertClassification(classificationName);

    if (result) {
      // Regenerate navigation to include new classification
      let nav = await utilities.getNav();

      // Success message
      req.flash("info", "New classification added successfully!");

      // Render the management view with the updated navigation
      res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash("info"),
      });
    } else {
      throw new Error("Failed to add classification.");
    }
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/inv/add-classification");
  }
};

/* ***************************
 *  Render Add Inventory Form
 * ************************** */
invCont.addInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav(); 
  try {
    // Fetch classification data using the model
    let classifications = await invModel.getClassifications();

    // Render the add-inventory view with all necessary fields
    res.render('./inventory/add-inventory', {
      title: 'Add New Vehicle',
      nav,
      classifications: classifications.rows, 
      make: '',
      model: '',
      year: '',
      description: '', 
      price: '',
      mileage: '',
      color: '',
      image: '',
      thumbnail: '',
      flashMessage: req.flash('flashMessage'),
      errors: req.flash('error')
    });
  } catch (error) {
    console.error('Error rendering add inventory view:', error);
    res.status(500).send('Internal Server Error');
  }
};

/* ***************************
 *  Process Add Inventory Form
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const vehicleData = {
      inv_make: req.body.make,
      inv_model: req.body.model,
      inv_year: req.body.year,
      inv_description: req.body.description || 'No description provided',
      inv_image: req.body.image || '/images/no-image.jpg',
      inv_thumbnail: req.body.thumbnail || '/images/no-image-thumb.jpg',
      inv_price: req.body.price,
      inv_miles: req.body.mileage,
      inv_color: req.body.color,
      classification_id: req.body.classification_id
    };

    const addedVehicle = await invModel.addInventory(vehicleData);

    if (addedVehicle) {
      res.redirect('/inv'); 
    } else {
      throw new Error("Failed to add vehicle to inventory.");
    }
  } catch (error) {
    next(error);
  }
}

invCont.showDeleteConfirm = async function (req, res, next) {
  const itemId = req.params.inv_id; // Fetch vehicle ID from the route
  const vehicleData = await invModel.getVehicleById(itemId); // Query DB for vehicle details by ID
  let nav = await utilities.getNav(); // Generate navigation

  if (vehicleData) {
      // If vehicle data is found, render the delete confirmation page with the vehicle details
      res.render('./inventory/delete-confirm', {
          title: `Delete ${vehicleData.inv_make} ${vehicleData.inv_model}`,
          nav,
          vehicleData, // Pass the vehicle data to the view
          flashMessage: req.flash('flashMessage'),
          errors: req.flash('error'),
      });
  } else {
      // If no vehicle found, send 404 error
      res.status(404).send("Vehicle not found");
  }
};


invCont.deleteInventoryItem = async function (req, res, next) {
    try {
        const itemId = req.body.inv_id; // Make sure to match the form field name
        await invModel.deleteInventoryItem(itemId); // Delete item from database
        res.redirect('/inv'); // Redirect to inventory list after deletion
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).send('Internal Server Error');
    }
};


invCont.getInventoryByClassificationId = async function (req, res, next) {
  try {
      const classificationId = req.params.classificationId;
      const data = await invModel.getInventoryByClassificationId(classificationId); // Make sure this function returns the correct items
      res.json(data); 
  } catch (error) {
      console.error('Error fetching inventory items:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = invCont