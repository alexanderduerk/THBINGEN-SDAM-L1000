const searchArg = require('./searchargs');
/**
 * Typechecking function to detect type errors early
 * @param {string, number, boolean}
 * @param {string, number, boolean}
 */
function checkType(value, expectedType) {
  if (typeof value !== expectedType) {
    // throw a type error
    throw new TypeError(`Expected ${expectedType}, got ${typeof value}`);
  }
}

/**
 * Datamodel defines all data for the cellinfos table
 */
/**
 * Represents a cell line with various attributes.
 */
class Cells {
  /**
   * Constructor for the cells class
   * @param {HashMap} keyValuePairs - Attributes and their values
   */
  constructor(keyValuePairs) {
    const expectedTypes = {
      cell_name: 'string',
      cellosaurus_id: 'string',
      donor_age: 'number',
      doubling_time: 'string',
      growth_medium: 'string',
      cell_type: 'string',
      donor_ethnicity: 'string',
      donor_sex: 'string',
      donor_tumor_phase: 'string',
      cell_lineage: 'string',
      primary_disease: 'string',
      subtype_disease: 'string',
      provider_name: 'string',
      growth_pattern: 'string',
    };
    // use a dynamic constructor approach
    Object.keys(keyValuePairs).forEach((key) => {
      checkType(keyValuePairs[key], expectedTypes[key]);
      this[key] = keyValuePairs[key];
    });
  }

  /**
   * Write Function for inserting the instance into the db
   * @param {object}
   */

  async createOne(dbconnection) {
    // get all columns
    const columns = Object.keys(this);
    // get all values
    const values = Object.values(this);
    // define the placeholder ?s
    const placeholders = columns.map(() => '?').join(',');
    // define the sql statement
    const sql = `INSERT INTO cells (${columns.join(',')}) VALUES (${placeholders})`;
    // Execute SQL statement with the instanced values
    const dbres = await dbconnection.run(sql, ...values);
    // return the newly inserted cell
    const newcell = await dbconnection.get(
      'SELECT * FROM cells WHERE cell_name = ?',
      this.cell_name
    );
    return newcell;
  }

  /**
   * Delete Function for the cellinfos table
   * @param {dbconnection, celliname}
   */
  // sql statement
  static async deleteOne(dbconnection, cellid) {
    const sql = 'DELETE FROM cells WHERE cell_id = ?';
    const dbres = await dbconnection.run(sql, cellid);
    // return a console.log that the given cell was deleted
    console.log(`Cell with cell_id: ${cellid} was deleted`);
  }

  /**
   * Updates a single row in the "cells" table with the given id, column, and new value.
   *
   * @param {object} dbconnection - The database connection object.
   * @param {number} id - The id of the row to update.
   * @param {string} column - The column to update.
   * @param {any} newvalue - The new value to set.
   * @return {Promise<object>} - A Promise that resolves to the updated row.
   */
  static async updateOne(dbconnection, id, column, newvalue) {
    const sql = `UPDATE cells SET ${column} = ? WHERE cell_id = ${id}`;
    const dbres = await dbconnection.run(sql, newvalue);
    // return the newly updated Row
    const updatedCell = await dbconnection.get(
      'SELECT * FROM cells WHERE cell_id = ?',
      id
    );
    return updatedCell;
  }

  /**
   * Reads cellrecord from the database based on the provided search parameters.
   *
   * @param {object} searcharg - The search parameters to filter the results.
   * @param {string} orderarg - The order in which to sort the results.
   * @param {object} paginationarg - The pagination parameters for the results.
   * @param {object} dbconnection - The database connection object.
   * @return {Promise<Array>} - A Promise that resolves to an array of cell records that match the search criteria.
   */
  static async search(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'cells')
        : 'SELECT * FROM cells';
    console.log(`SQL generated to search Cells:\n${JSON.stringify(searchSql)}`);
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    console.log(dbResult);
    return dbResult;
  }

  /**
   * Reads cellrecord from the database based on the provided search parameters.
   *
   * @param {object} searcharg - The search parameters to filter the results.
   * @param {string} orderarg - The order in which to sort the results.
   * @param {object} paginationarg - The pagination parameters for the results.
   * @param {object} dbconnection - The database connection object.
   * @return {Promise<Array>} - A Promise that resolves to an array of cell records that match the search criteria.
   */
  static async searchUI(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'cellsUI')
        : 'SELECT * FROM cells';
    console.log(`SQL generated to search Cells:\n${JSON.stringify(searchSql)}`);
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    console.log(dbResult);
    return dbResult;
  }
  // Read by ID

  static async readById(id, dbconnection) {
    console.log(id);
    const sql = 'SELECT * FROM cells WHERE cell_id = ?';
    const dbres = await dbconnection.get(sql, id);
    console.log(dbres);
    return dbres;
  }
}

module.exports = Cells;
