const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    } catch (error) {
      console.error("Database error:", error.message); // Log the error
      throw error; // Re-throw the error so it can be handled in the controller
    }
}
  

module.exports = { registerAccount }