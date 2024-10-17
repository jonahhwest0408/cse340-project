const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get vehicle by inv_id
 * ************************** */
async function getVehicleById(vehicleId) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [vehicleId]
    );
    return data.rows[0]; //return a single vehicle
  } catch (error) {
    console.error("getVehicleById error: " + error);
  }
}

/* ***************************
 *  Insert new classification into the database
 * ************************** */
async function insertClassification(classificationName) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classificationName]);
    return result.rowCount;
  } catch (error) {
    console.error("Error inserting classification:", error);
    throw error;
  }
}

/* ***************************
 *  Insert new vehicle into the database
 * ************************** */
async function addInventory(vehicleData) {
  try {
    const sql = `
      INSERT INTO public.inventory 
      (inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
      VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    const result = await pool.query(sql, [
      vehicleData.inv_make,
      vehicleData.inv_model,
      vehicleData.inv_year,
      vehicleData.inv_description,
      vehicleData.inv_image,
      vehicleData.inv_thumbnail,
      vehicleData.inv_price,
      vehicleData.inv_miles,
      vehicleData.inv_color,
      vehicleData.classification_id
    ]);
    return result.rows[0]; // Return the newly inserted vehicle data
  } catch (error) {
    console.error("Error adding vehicle to inventory:", error);
    throw error; // Rethrow the error to be handled in the controller
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, insertClassification, addInventory, deleteInventoryItem }