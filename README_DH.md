# Project Overview

This Readme file contains the goals I set for specific functions and how I realized them. Additionally I mention problems that occured and some thought processes that were involved in the realization of the functions.

## [SQL Table Design](l1000.sql)

#### Database Design Overview

Initially, our approach to the database design was to create a modular Mainviews table that would be dynamically generated upon each search request. However, this proved to be too time-consuming and computationally intensive, as the algorithm required would need to process the entire database to reconstruct this single table for every search. As a result, we shifted our focus and decided to use the signature_infos table as the main table. This table contains the majority of essential data entries, streamlining access and improving performance.

#### Table Relationships and Structure

The signature_infos table is primarily related to other tables through one-to-one relationships. The foreign keys “cell_name” and “pert_name” reference their respective tables, ensuring data integrity and consistency, with “sig_id” serving as the primary key for the table.

```sql
CREATE TABLE IF NOT EXISTS signature_infos (
   sig_id INTEGER PRIMARY KEY AUTOINCREMENT,
   sig_name VARCHAR(50) UNIQUE NOT NULL ON CONFLICT IGNORE,
   pert_name VARCHAR(30) NOT NULL,
   cmap_name VARCHAR(30),
   pert_type VARCHAR(30),
   cell_name VARCHAR(30) NOT NULL,
   bead_batch VARCHAR(10),
   pert_dose VARCHAR(20),
   pert_time VARCHAR(20),
   nsamples INTEGER,
   cc_q75 FLOAT,
   ss_ngene INTEGER NOT NULL,
   tas FLOAT, -- Transcriptional Activity Score
   pct_self_rank_q25 FLOAT,
   wt VARCHAR(20),
   median_recall_rank_spearman FLOAT,
   median_recall_rank_wtcs_50 FLOAT,
   median_recall_score_spearman FLOAT,
   median_recall_score_wtcs_50 FLOAT,
   batch_effect_tstat INTEGER,
   batch_effect_tstat_pct FLOAT,
   is_hiq INTEGER CHECK (is_hiq IN (0, 1)), -- BOOLEAN CHECK
   qc_pass INTEGER,
   det_wells VARCHAR(20),
   det_plates VARCHAR(50),
   distil_ids VARCHAR(50),
   project_code VARCHAR(20),
   FOREIGN KEY(pert_name) REFERENCES perturbagens(pert_name),
   FOREIGN KEY(cell_name) REFERENCES cells(cell_name)
)
```

1. **Primary Key** (sig_id): The sig_id is the primary key of the signature_infos table and is set to auto-increment, ensuring each record has a unique identifier.

2. **Unique Constraints** and Conflict Handling: The sig_name field is defined as unique, with a conflict resolution strategy to ignore duplicate entries, which helps maintain data integrity.

3. **Foreign Key Relationships**:
   The pert_name column is linked to the perturbagens table, enforcing a relationship that ensures all perturbations referenced in signature_infos exist in the perturbagens table.
   Similarly, the cell_name column references the cells table, establishing a direct link to the corresponding cell types.

## [Class construction](siginfo.js)

The next step in the development process was constructing the SignatureInfo class. A key focus during this phase was implementing rigorous type checking for expected inputs. This approach ensures that the program functions as intended and significantly reduces the likelihood of type-related bugs, enhancing overall code reliability and maintainability.

```js
/**
 * Checks if the type of a value is the expected type.
 *
 * @param {*} value - The value to check the type of.
 * @param {string} expectedType - The expected type of the value.
 * @throws {TypeError} If the type of the value is not the expected type.
 * @return {void}
 */
function checkType(value, expectedType) {
  if (typeof value !== expectedType) {
    // throw a type error
    throw new TypeError(`Expected ${expectedType}, got ${typeof value}`);
  }
}
```

Next the Class was constructed as shown below

```js
/**
 * Datamodel defines all data for the signature table
 * Represents a signature with various attributes
 */
class Signatureinfo {
  /**
   * Constructs a new instance of the Signatureinfo class.
   *
   * @param {Object} keyValuePairs - An object containing key-value pairs to initialize the instance.
   * @throws {TypeError} If the type of a value does not match the expected type.
   * @return {void}
   */
  constructor(keyValuePairs) {
    const expectedTypes = {
      sig_name: 'string',
      pert_name: 'string',
      cmap_name: 'string',
      pert_type: 'string',
      cell_name: 'string',
      bead_batch: 'string',
      pert_dose: 'string',
      pert_time: 'string',
      nsamples: 'number',
      cc_q75: 'number',
      ss_ngene: 'number',
      tas: 'number',
      pct_self_rank_q25: 'number',
      wt: 'string',
      median_recall_rank_spearman: 'number',
      median_recall_rank_wtcs_50: 'number',
      median_recall_score_spearman: 'number',
      median_recall_score_wtcs_50: 'number',
      batch_effect_tstat: 'number',
      batch_effect_tstat_pct: 'number',
      is_hiq: 'boolean',
      qc_pass: 'boolean',
      det_wells: 'string',
      det_plates: 'string',
      distil_ids: 'string',
      project_code: 'string',
    };
    // use a dynamic constructor approach
    Object.keys(keyValuePairs).forEach((key) => {
      checkType(keyValuePairs[key], expectedTypes[key]);
      this[key] = keyValuePairs[key];
    });
  }
```

## [FUNCTIONS](siginfo.js)

The core functions provided in the lecture were adapted to fit our codebase with minor modifications. These functions include `createOne` for creating a record, `deleteOne` for removing a record, `updateOne` for modifying a record, and `readByID` for retrieving a record by its identifier. The implementation details of these functions are as follows:

### CREATE

```js
/**
   * Creates a new signature info in the database.
   *
   * @param {object} dbconnection - The database connection object.
   * @return {object} The newly inserted signature info object.
   */
  async createOne(dbconnection) {
    // get all columns
    const columns = Object.keys(this);
    // get all values
    const values = Object.values(this);
    // define the placeholder ?s
    const placeholders = columns.map(() => '?').join(',');
    // define sql statement
    const sql = `INSERT INTO signature_infos (${columns.join(',')}) VALUES (${placeholders})`;
    // Execute SQL statement with the instanced values
    const dbres = await dbconnection.run(sql, ...values);
    // return the newly inserted signature
    const newsigname = await dbconnection.get(
      `SELECT * FROM signature_infos WHERE sig_name = ?`,
      this.sig_name
    );
    return newsigname;
  }
```

### DELETE

```js
/**
   * Deletes a signature info from the database.
   *
   * @param {object} dbconnection - The database connection object.
   * @param {string} signame - The name of the signature info to delete.
   * @return {void}
   */
  static async deleteOne(dbconnection, sigid) {
    const sql = `DELETE FROM signature_infos WHERE sig_id = ?`;
    const dbres = await dbconnection.run(sql, `${sigid}`);
  }
```

### UPDATE

```js
/**
   * Updates a single row in the "signature_infos" table with the given signature name, column, and new value.
   *
   * @param {object} dbconnection - The database connection object.
   * @param {string} signame - The name of the signature info to update.
   * @param {string} column - The column to update.
   * @param {any} newvalue - The new value to set.
   * @return {object} The updated signature info object.
   */
  static async updateOne(dbconnection, sigid, column, newvalue) {
    const sql = `UPDATE signature_infos SET ${column} = ? WHERE sig_id = ${sigid}`;
    const dbres = await dbconnection.run(sql, newvalue);
    // return a console.log that the given pertubagens was updated
    const updatedSignatureinfo = await dbconnection.get(
      'SELECT * FROM signature_infos WHERE sig_id = ?',
      sigid
    );
    return updatedSignatureinfo;
  }
```

### READ BY ID

```js
 // Read by ID

  static async readById(id, dbconnection) {
    console.log(id);
    const sql = 'SELECT * FROM signature_infos WHERE sig_id = ?';
    const dbres = await dbconnection.get(sql, id);
    console.log(dbres);
    return dbres;
  }
```

## [SEARCHES](<(siginfo.js)>)

The search parameters are based on the code provided in the lecture and were implemented for querying `signature_infos` and `genetargets`. Additionally, I was tasked with creating a simplified version of the table with fewer columns for the user interface, referred to as `signature_infosUI`.

### Searches for the signatures

```js
/**
   * Searches for signature information in the database based on the provided search argument.
   *
   * @param {object} searcharg - The search argument to use for the query.
   * @param {number} limit - The maximum number of results to return.
   * @param {number} offset - The offset from which to start returning results.
   * @param {object} dbconnection - The database connection object.
   * @return {array} An array of search results.
   */
  static async search(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'signature_infos')
        : 'SELECT * FROM signature_infos';
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    return dbResult;
  }
```

### Searches for the compounds

```js
/**
   * Searches for compounds in the database based on the provided search argument.
   *
   * @param {object} searcharg - The search argument to use for the query.
   * @param {number} limit - The maximum number of results to return.
   * @param {number} offset - The offset from which to start returning results.
   * @param {object} dbconnection - The database connection object.
   * @return {array} An array of search results.
   */
  static async searchcompounds(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'genetargets')
        : 'SELECT * FROM signature_infos';
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    return dbResult;
  }
```

### Searches for the UI

```js
/**
   * Searches for signature information in the database based on the provided search argument.
   *
   * @param {object} searcharg - The search argument to use for the query.
   * @param {number} limit - The maximum number of results to return.
   * @param {number} offset - The offset from which to start returning results.
   * @param {object} dbconnection - The database connection object.
   * @return {array} An array of search results.
   */
  static async searchUI(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'signature_infosUI')
        : 'SELECT * FROM signature_infos';
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    return dbResult;
  }
```

## [SearchArg](searchargs.js)

The tables were created respectivly in the [searchArg](searchargs.js).

### Signature_infos

```js
if (table === 'signature_infos') {
  header = `SELECT sig_name AS 'Signature Name', pert_name AS 'compound', cmap_name AS 'Connectivity Map', cell_name AS 'Cells', bead_batch AS 'Batch Nr.', pert_dose AS 'Dosage', pert_time AS 'Perturbation period', nsamples AS 'Number of Samples', cc_q75 AS 'landmark space', ss_ngene AS 'Number of Genes', tas AS 'Transcriptional activity score', pct_self_rank_q25 AS 'Self connectivity', wt AS 'Wheight list', median_recall_rank_spearman AS 'MRR1', median_recall_rank_wtcs_50 as 'MRR50', median_recall_score_spearman AS 'MRS1', median_recall_score_wtcs_50 as 'MRS50', batch_effect_tstat AS 'Batch effect', batch_effect_tstat_pct AS 'Batch effect %', is_hiq AS 'High Quality', qc_pass AS 'Quality control pass', det_wells AS 'Detection wells', det_plates AS 'Detected plates', distil_ids AS 'Replicate IDs', project_code AS 'Project code' FROM ${table} WHERE `;
  typemapper = siginfotypes;
}
```

### Signature_infosUI

Note that this is an assembled table which gets the gene target through the `perturbagens` table. and is displayed as the main Table that will be queried.

```js
if (table === 'signature_infosUI') {
  header = `SELECT  si.sig_name,
                      si.pert_name,
                      at.gene_target,
                      si.cell_name,
                      si.pert_dose, 
                      si.pert_time,
                      si.ss_ngene,
                      si.tas,
                      si.is_hiq,
                      si.qc_pass
              FROM signature_infos si LEFT JOIN
              perturbagens at ON si.pert_name = at.pert_name
              WHERE `;
  typemapper = geneinfotypes;
}
```

### Compounds

```js
if (table === 'genetargets') {
  header = `SELECT si.sig_name AS 'Signature Name',
                     at.gene_target AS 'Targeted Gene',
                     at.pert_name AS 'Compound',
                     si.cmap_name AS 'Connectivity Map',
                     si.cell_name AS 'Cells',
                     si.bead_batch AS 'Batch Nr.',
                     si.pert_dose AS 'Dosage',
                     si.pert_time AS 'Perturbation Period',
                     si.nsamples AS 'Number of Samples',
                     si.cc_q75 AS 'Landmark Space',
                     si.ss_ngene AS 'Number of Genes',
                     si.tas AS 'Transcriptional Activity Score',
                     si.pct_self_rank_q25 AS 'Self Connectivity',
                     si.wt AS 'Weight List',
                     si.median_recall_rank_spearman AS 'MRR1',
                     si.median_recall_rank_wtcs_50 AS 'MRR50',
                     si.median_recall_score_spearman AS 'MRS1',
                     si.median_recall_score_wtcs_50 AS 'MRS50',
                     si.batch_effect_tstat AS 'Batch Effect',
                     si.batch_effect_tstat_pct AS 'Batch Effect %',
                     si.is_hiq AS 'High Quality',
                     si.qc_pass AS 'Quality Control Pass',
                     si.det_wells AS 'Detection Wells',
                     si.det_plates AS 'Detected Plates',
                     si.distil_ids AS 'Replicate IDs',
                     si.project_code AS 'Project Code'
              FROM signature_infos si
              LEFT JOIN perturbagens at
              ON si.pert_name = at.pert_name
              WHERE`;
  typemapper = geneinfotypes;
}
```

## [Server functions](app.js)

To correctly execute queries from the server side, the following functions were implemented. Two distinct `POST` functions were developed: one for querying the sigino table and another for querying the UI table. This allowed us to include the desired genetarget as additional information in the main table. The implemented functions include `post`, `delete`, and `put`. The code was adapted from the lecture materials with slight modifications to suit our requirements. Additionally, the `put` command was replaced with a `patch` command to avoid overwriting the entire table, as patch allows for updating individual records

### Post to `create0ne`

```js
// Post Function sig_info
app.post('/siginfo', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Create a new instance of the signature_infos class
    const Signatureinstance = new Signatureinfo(req.body);
    // Call Create One on the instance
    const newsigid = await Signatureinstance.createOne(db);
    res.json(newsigid);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});
```

### Post to `search`

```js
/*
 * Search Request for the sig_info table
 */
app.post('/siginfo/search', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  // Parse the JSON string into an object
  let searchArg;
  if (searchArgString && typeof searchArgString === 'string') {
    try {
      searchArg = JSON.parse(searchArgString);
    } catch (e) {
      console.error('Error parsing searchArg:', e);
      return res.status(400).send('Invalid searchArg format.');
    }
  } else {
    searchArg = searchArgString;
  }
  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
  const searchArgObject = {
    field,
    op,
    val,
    limit: parseInt(limit, 10) || 10, // Convert to number with a default value
    offset: parseInt(offset, 10) || 0, // Convert to number with a default value
    order,
    orderfield,
    descendants: Array.isArray(descendants) ? descendants : [], // Ensure descendants is an array
  };
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Query the db
    const signatures = await Signatureinfo.search(
      searchArgObject,
      searchArg.limit,
      searchArg.offset,
      db
    );
    // Return the result:
    if (req.accepts('html')) {
      res.render(
        'siginfofull.ejs',
        { data: signatures, siteSearchArg: searchArgObject },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      res.json(signatures);
    }
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});
```

### Post to `searchUI`

```js
/*
 * Search Request for the sig_info table
 */
app.post('/siginfo/searchUI', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  // Parse the JSON string into an object
  let searchArg;
  if (searchArgString && typeof searchArgString === 'string') {
    try {
      searchArg = JSON.parse(searchArgString);
    } catch (e) {
      console.error('Error parsing searchArg:', e);
      return res.status(400).send('Invalid searchArg format.');
    }
  } else {
    searchArg = searchArgString;
  }
  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
  const searchArgObject = {
    field,
    op,
    val,
    limit: parseInt(limit, 10) || 10, // Convert to number with a default value
    offset: parseInt(offset, 10) || 0, // Convert to number with a default value
    order,
    orderfield,
    descendants: Array.isArray(descendants) ? descendants : [], // Ensure descendants is an array
  };
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Query the db
    const signatures = await Signatureinfo.searchUI(
      searchArgObject,
      searchArg.limit,
      searchArg.offset,
      db
    );
    // Return the result:
    if (req.accepts('html')) {
      res.render(
        'siginfo.ejs',
        { data: signatures, siteSearchArg: searchArgObject },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      // res.json(signatures);
    }
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});
```

### Patch to `update0ne`

```js
// Patch Signatures
app.patch(`/siginfo`, async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: `./l1000.db`,
      driver: sqlite3.Database,
    });
    // Extract the pert_id to be updated from request body
    const { sig_name, column, newvalue } = req.body;
    // Call updateOne function
    const updatedSignatureinfo = await Signatureinfo.updateOne(
      db,
      sig_name,
      column,
      newvalue
    );
    // Send a success response
    res.json(updatedSignatureinfo);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});
```

### Delete to `delete0ne`

```js
// Delete a Signature
app.delete('/siginfo/:id', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');

    // Extract the pert_id from the request body
    const sigid = req.params.id;
    // Call deleteOne function
    await Signatureinfo.deleteOne(db, sigid);
    res.status(200).send(`Deleted Pertubagens record with pert_id: ${sigid}`);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});
```

## [CALLS](calls.sh)

With all functions and tables implemented, I focused on my part of the project: developing proper function calls to test the feasibility of the data warehouse for all tables. The testing process involved: `creating` a test entry, `searching` for this entry to retrieve its id, extracting this id to `update` the entry, and then using the entry in a more `complex searchArg` based on two or more input values. Finally, the entry was `deleted`, ensuring no test entries remained in the database after the tests. These functions were adapted from the provided lecture code and adjusted to handle entries appropriately for each table.

### Genes

```js
#!/bin/bash

# Define the base URL for your API
base_url="http://localhost:3000/genes"

# Step 1: Create a new entry using POST
# echo "Creating a new gene entry..."
create_response=$(curl -s -X POST "$base_url" \
  -H "Content-Type: application/json" \
  -d '{
  "entrez_id":777777,
  "gene_symbol":"TEST1",
  "ensembl_id":"TEST2",
  "gene_title":"TEST3",
  "gene_type":"TEST4",
  "src":"TEST5",
  "feature_space":"TEST6"
}')

echo "Successfully created Gene: $create_response"

# Step 2: Search the created entry to get its ID
# Define the URL of the server route
url="http://localhost:3000/genes/search"

# Use this JSON object in the curl request
response=$(curl -s -X POST "$url" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "asc",
      "descendants": false,
      "field": "gene_symbol",
      "op": "contains",
      "val": "TEST1",
      "orderfield": "gene_symbol"
  }}')

echo "Sucessfully searched for the created Gene: $response"

# Step 3 Extract the ID from the search response
gene_id=$(echo "$response" | jq -r '.[0].gene_id')

# echo "Updating the entry with ID: $gene_id..."
curl -s -X PATCH "$base_url" \
  -H "Content-Type: application/json" \
  -d '{
  "geneid": "'$gene_id'",
  "columnname": "feature_space",
  "newvalue": "UPDATED"
  }'

url="http://localhost:3000/genes/search"

# Step 4 Use this JSON object in the curl request
updated_entry=$(curl -s -X POST "$url" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "asc",
      "descendants": false,
      "field": "gene_symbol",
      "op": "contains",
      "val": "TEST1",
      "orderfield": "gene_symbol"
  }}')

echo "Successfully updated Geneentry: $updated_entry"

# Step 5 Complex Search test
  url="http://localhost:3000/genes/search"

  # Use this JSON object in the curl request
  updated_complex=$(curl -s -X POST "$url" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "ASC",
      "field": "",
      "op": "AND",
      "val": "",
      "orderfield": "gene_symbol",
      "descendants": [
          {
            "op": "contains",
            "val": "H",
            "field": "gene_symbol"},
          {
            "op": "contains",
            "val": "histone",
            "field": "gene_title"}]
  }}')

echo "Sucessfully searched with descendants: $updated_complex"

# Step 6 Delete the entry

deleted_entry=$(curl -s -X DELETE "$base_url/$gene_id")
echo "Sucessfully deleted: $deleted_entry"
```

### Cells

```js
# Define the base URL for your API
cells_url="http://localhost:3000/cells"

# Step 1: Create a new entry using POST
# echo "Creating a new Cell entry..."
create_cellresponse=$(curl -s -X POST "$cells_url" \
  -H "Content-Type: application/json" \
  -d '{
  "cell_name":"CELL1",
  "cellosaurus_id":"TESTID",
  "donor_age":10,
  "doubling_time":"10h",
  "growth_medium":"TESTMEDIUM",
  "cell_type":"TESTTYPE",
  "donor_ethnicity":"CAUCASIAN",
  "donor_sex":"M",
  "donor_tumor_phase":"S4",
  "cell_lineage":"TESTLINEAGE",
  "primary_disease":"TESTDISEASE",
  "subtype_disease":"TESTSUBTYPE",
  "provider_name":"TESTPROVIDER",
  "growth_pattern":"TESTPATTERN"
}')

echo "Successfully created Cell: $create_cellresponse"

# Step 2: Search the created entry to get its ID
# Define the URL of the server route
cells_url="http://localhost:3000/cells"

# Use this JSON object in the curl request
cellresponse=$(curl -s -X POST "$cells_url/search" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "ASC",
      "descendants": false,
      "field": "cell_name",
      "op": "contains",
      "val": "CELL1",
      "orderfield": "cell_name"
  }}')

echo "Sucessfully searched for the created Cell: $cellresponse"

# Step 3 Extract the ID from the search response
cell_id=$(echo "$cellresponse" | jq -r '.[0].cell_id')

echo $cell_id

# echo "Updating the entry with ID: $cell_id..."
curl -s -X PATCH "$cells_url" \
  -H "Content-Type: application/json" \
  -d '{
  "cellid": "'$cell_id'",
  "columnname": "cell_name",
  "newvalue": "UPDATED"
  }'

cells_url="http://localhost:3000/cells/search"

# Step 4 Use this JSON object in the curl request
updated_entry=$(curl -s -X POST "$cells_url" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "asc",
      "descendants": false,
      "field": "cell_name",
      "op": "contains",
      "val": "UPDATED",
      "orderfield": "cell_name"
  }}')

echo "Successfully updated Cellentry: $updated_entry"

  # Step 5 Complex Search test
  cells_url="http://localhost:3000/cells/search"

  # Use this JSON object in the curl request
  updated_cellcomplex=$(curl -s -X POST "$cells_url" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "ASC",
      "field": "",
      "op": "AND",
      "val": "",
      "orderfield": "cell_name",
      "descendants": [
          {
            "op": "contains",
            "val": "U",
            "field": "cell_name"},
          {
            "op": "contains",
            "val": "T",
            "field": "growth_pattern"}]
  }}')

echo "Sucessfully searched with descendants: $updated_cellcomplex"

cells_url="http://localhost:3000/cells"

# Step 6 Delete the entry

deleted_cellentry=$(curl -s -X DELETE "$cells_url/$cell_id")
echo "Sucessfully deleted: $deleted_cellentry"
```

### Compounds

```js
# Define the base URL for your API
pert_url="http://localhost:3000/perturbations"

# Step 1: Create a new entry using POST
# echo "Creating a new Perturbation entry..."
create_pertresponse=$(curl -s -X POST "$pert_url" \
  -H "Content-Type: application/json" \
  -d '{
    "pert_name": "PERT123",
    "cmap_name": "CMAP123",
    "gene_target": "GENETARGET123",
    "moa": "TESTMOA",
    "canonical_smiles": "TEST",
    "inchi_key": "TESTKEY",
    "compound_aliases": "TESTALIAS"
}')

echo "Successfully created Perturbation: $create_pertresponse"

# Step 2: Search the created entry to get its ID
# Define the URL of the server route
pert_url="http://localhost:3000/perturbations"

# Use this JSON object in the curl request
pertresponse=$(curl -s -X POST "$pert_url/search" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "ASC",
      "descendants": false,
      "field": "pert_name",
      "op": "contains",
      "val": "PERT123",
      "orderfield": "pert_name"
  }}')

echo "Sucessfully searched for the created Perturbation: $pertresponse"

# Step 3 Extract the ID from the search response
pert_id=$(echo "$pertresponse" | jq -r '.[0].pert_id')

echo $pert_id

pert_url="http://localhost:3000/perturbations"
# echo "Updating the entry with ID: $pert_id..."
curl -s -X PATCH "$pert_url" \
  -H "Content-Type: application/json" \
  -d '{
  "pertid": "'$pert_id'",
  "column": "pert_name",
  "newvalue": "UPDATED"
  }'

pert_url="http://localhost:3000/perturbations/search"

# Step 4 Use this JSON object in the curl request
updated_entry=$(curl -s -X POST "$pert_url" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "asc",
      "descendants": false,
      "field": "pert_name",
      "op": "contains",
      "val": "UPDATED",
      "orderfield": "pert_name"
  }}')

echo "Successfully updated Perturbation entry: $updated_entry"

  # Step 5 Complex Search test
  pert_url="http://localhost:3000/perturbations/search"

  # Use this JSON object in the curl request
  updated_pertcomplex=$(curl -s -X POST "$pert_url" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "ASC",
      "field": "",
      "op": "AND",
      "val": "",
      "orderfield": "pert_name",
      "descendants": [
          {
            "op": "contains",
            "val": "U",
            "field": "pert_name"},
          {
            "op": "contains",
            "val": "CMAP123",
            "field": "cmap_name"}]
  }}')

echo "Sucessfully searched with descendants: $updated_pertcomplex"

pert_url="http://localhost:3000/perturbations"

 # Step 6 Delete the entry

deleted_pertentry=$(curl -s -X DELETE "$pert_url/$pert_id")
echo "Sucessfully deleted: $deleted_pertentry"
```

### Siginfo

```js
# Define the base URL for your API
sig_url="http://localhost:3000/siginfo"

# Step 1: Create a new entry using POST
# echo "Creating a new Signature entry..."
create_sigresponse=$(curl -s -X POST "$sig_url" \
  -H "Content-Type: application/json" \
  -d '{
    "sig_name": "SIG123",
    "pert_name": "PERT123",
    "cmap_name": "CMAP123",
    "pert_type": "TYPE123",
    "cell_name": "CELL1",
    "bead_batch": "B10",
    "pert_dose": "TESTDOSE",
    "pert_time": "TESTIME",
    "nsamples": 2,
    "cc_q75": 0.1,
    "ss_ngene": 1,
    "tas": 0.1,
    "pct_self_rank_q25": 0.1,
    "wt": "TEST123",
    "median_recall_rank_spearman": 0.1,
    "median_recall_rank_wtcs_50": 0.1,
    "median_recall_score_spearman": 0.1,
    "median_recall_score_wtcs_50": 0.1,
    "batch_effect_tstat": 1,
    "batch_effect_tstat_pct": 0.1,
    "is_hiq": true,
    "qc_pass": true,
    "det_wells": "A1",
    "det_plates": "PLATE123",
    "distil_ids": "IDTEST123",
    "project_code": "TEST777"
}')

echo "Successfully created Signature: $create_sigresponse"

# Step 2: Search the created entry to get its ID
# Define the URL of the server route
sig_url="http://localhost:3000/siginfo"

#  Step 4 Use this JSON object in the curl request
sigresponse=$(curl -s -X POST "$sig_url/search" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "ASC",
      "descendants": false,
      "field": "sig_name",
      "op": "contains",
      "val": "SIG123",
      "orderfield": "sig_name"
  }}')

echo "Sucessfully searched for the created Signature: $sigresponse"

# Step 3 Extract the ID from the search response
sig_id=$(echo "$sigresponse" | jq -r '.[0].sig_id')

echo $sig_id

sig_url="http://localhost:3000/siginfo"
# echo "Updating the entry with ID: $pert_id..."
curl -s -X PATCH "$sig_url" \
  -H "Content-Type: application/json" \
  -d '{
  "sig_name": "'$sig_id'",
  "column": "sig_name",
  "newvalue": "UPDATED"
  }'

sig_url="http://localhost:3000/siginfo/search"

# Step 4 Use this JSON object in the curl request
updated_entry=$(curl -s -X POST "$sig_url" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "asc",
      "descendants": false,
      "field": "sig_name",
      "op": "contains",
      "val": "UPDATED",
      "orderfield": "sig_name"
  }}')

echo "Successfully updated Signature entry: $updated_entry"

  # Step 5 Complex Search test
  sig_url="http://localhost:3000/siginfo/search"

  # Use this JSON object in the curl request
  updated_sigcomplex=$(curl -s -X POST "$sig_url" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "ASC",
      "field": "",
      "op": "AND",
      "val": "",
      "orderfield": "sig_name",
      "descendants": [
          {
            "op": "contains",
            "val": "U",
            "field": "sig_name"},
          {
            "op": "contains",
            "val": "CMAP123",
            "field": "cmap_name"}]
  }}')

echo "Sucessfully searched with descendants: $updated_sigcomplex"

# Step 6 Delete the entry

sig_url="http://localhost:3000/siginfo"

deleted_sigentry=$(curl -s -X DELETE "$sig_url/$sig_id")
echo "Sucessfully deleted: $deleted_sigentry"
```

Now that the database functionality was validated, I inserted the data into the database as shown below:

```js
.mode csv

.import /Users/daron/Documents/GitHub/SDAM-L1000/siginfo.csv tempsignature_infos
.import /Users/daron/Documents/GitHub/SDAM-L1000/cellinfo.csv tempcells
.import /Users/daron/Documents/GitHub/SDAM-L1000/genes.csv tempgenes
.import /Users/daron/Documents/GitHub/SDAM-L1000/compounds.csv tempperturbagens

INSERT INTO signature_infos ('sig_name', 'pert_name', 'cmap_name', 'pert_type', 'cell_name', 'bead_batch', 'pert_dose', 'pert_time', 'nsamples', 'cc_q75', 'ss_ngene', 'tas', 'pct_self_rank_q25', 'wt', 'median_recall_rank_spearman', 'median_recall_rank_wtcs_50', 'median_recall_score_spearman', 'median_recall_score_wtcs_50', 'batch_effect_tstat', 'batch_effect_tstat_pct', 'is_hiq', 'qc_pass', 'det_wells', 'det_plates', 'distil_ids','project_code') SELECT * FROM tempsignature_infos

INSERT INTO cells('cell_name', 'cellosaurus_id', 'donor_age', 'doubling_time', 'growth_medium', 'cell_type', 'donor_ethnicity', 'donor_sex', 'donor_tumor_phase', 'cell_lineage', 'primary_disease', 'subtype_disease', 'provider_name', 'growth_pattern') SELECT * FROM tempcells

INSERT INTO genes ('entrez_id', 'gene_symbol', 'ensembl_id', 'gene_title', 'gene_type', 'src', 'feature_space') SELECT * FROM tempgenes

INSERT INTO perturbagens ('pert_name', 'cmap_name', 'gene_target', 'moa', 'canonical_smiles', 'inchi_key', 'compound_aliases') SELECT * FROM tempperturbagens

DROP TABLE tempsignature_infos;
DROP TABLE tempcells;
DROP TABLE genes;
DROP TABLE tempgenes;
DROP TABLE tempperturbagens;
```

## User interfaces and Design

I was responsible for developing the homepage, the about page, and the contact page, as well as implementing the table display and creating links for specific column values.

Page: [About](views/about.ejs)

Page: [Contact](views/contact.ejs)

Page: [Siginfo](views/siginfo.ejs)

Page: [Siginfofull](views/siginfofull.ejs)

Page: [Homepage](index.ejs)

The first page design involved creating a window that recieves 3 search inputs for genes cells and compound based searches. The Navigationbar should contain the logo "L1000" linking to the homepage and on the right side of the navbar three links refering to the homepage, about page and the contact page.

#### Navigationbar

```ejs
<body>
    <nav class="navbar">
      <div class="container">
        <a href="/" class="logo">L1000</a>
        <ul class="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
        <div class="menu-toggle">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
      </div>
    </nav>

```

#### [Stylesheet](public/css/style.css)

I implemented a standard style and a hover effect for the navbar underlining links through hovering.

```css
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto';
  width: 100vw;
  overflow-x: hidden;
}

.navbar {
  height: 100px;
  background-color: #333;
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow for elevation */
  border-radius: 8px; /* Rounded corners for a modern look */
  display: flex;
  align-items: center;
  padding: 10px 20px;
  position: relative;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100vw;
  max-width: 100vw;
}

.logo {
  color: #fff;
  text-decoration: none;
  font-size: 48px;
  font-weight: bold;
}
.nav-links {
  list-style: none;
  display: flex;
  gap: 20px;
}

.nav-links li {
  position: relative;
}

.nav-links a {
  color: #fff;
  text-decoration: none;
  padding: 10px 15px;
  transition:
    color 0.3s,
    background-color 0.3s;
  font-size: 38px;
}

.nav-links a:hover {
  color: #333;
  background-color: #fff;
  border-radius: 5px;
  text-decoration: underline;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
}

.bar {
  background-color: #fff;
  height: 40px;
  width: 25px;
  margin: 3px 0;
  transition: 0.3s;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
    flex-direction: column;
    width: 100%;
    background-color: #333;
    position: absolute;
    top: 60px;
    left: 0;
  }

  .nav-links.active {
    display: flex;
  }

  .menu-toggle {
    display: flex;
  }
}
```

Next I created a grid container which should include three columns.The first column should provide initial information about the database. the second column should include the three searchplaceholders to give an input (gene, cell or compound) to search the `siginfo table_Ui` . The third column should display the logo of TH-Bingen.

#### Main body

Here i implemented the `grid-container` to start the three columns. The left column should contain a brief test text.

#### [First column](views/index.ejs)

```ejs
<div class="grid-container">
      <section class="about">
        <h1>What is this project about?</h1>
        <p>
          This project aims to deliver a user-friendly way to access and save
          data in a SQL database which stores the L1000 dataset. Also, we hope
          to get some analysis running, delivering several different graphical
          analysis tools for the user.
        </p>
      </section>
```

stylesheet

```css
/* CSS Grid for the layout */
.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr; /* Three columns */
  gap: 20px; /* Space between columns */
  padding: 20px; /* Padding around the grid */
}

.contact-grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 30px;
  padding: 20px;
}

.about {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.about-ABPage {
  position: absolute;
  top: 200px;
  display: flex;
  width: 60%;
}

.about h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
  font-weight: 700;
}

.about p {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
}
```

The second column included the searchinputfields for the respective forms to query the siginfo table. Therefore the `updateFieldAndSubmit` function was implemented to create a new SearchArg and submit it to the database.

#### [Second column](views/index.ejs)

```js
<div class="search-window">
  <div class="widget">
    <h2>Search by Cell</h2>
    <form
      id="searchFormCells"
      action="/siginfo/searchUI"
      method="post"
      enctype="application/x-www-form-urlencoded"
    >
      <input
        type="text"
        id="cellval"
        value=""
        placeholder="Search by cellname"
      />
      <input type="hidden" id="searchArgCells" name="searchArg" />
      <button
        type="button"
        onclick="updateFieldAndSubmit('cell_name', 'searchArgCells', 'searchFormCells', 'cellval')"
      >
        Search
      </button>
    </form>
  </div>

  <div class="widget">
    <h2>Search by Compound</h2>
    <form
      id="searchFormCompounds"
      action="/siginfo/searchUI"
      method="post"
      enctype="application/x-www-form-urlencoded"
    >
      <input
        type="text"
        id="compoundval"
        value=""
        placeholder="Search by compound"
      />
      <input type="hidden" id="searchArgCompounds" name="searchArg" />
      <button
        type="button"
        onclick="updateFieldAndSubmit('at.pert_name', 'searchArgCompounds', 'searchFormCompounds', 'compoundval')"
      >
        Search
      </button>
    </form>
  </div>

  <div class="widget">
    <h2>Search by Gene</h2>
    <form
      id="searchFormGenes"
      action="/siginfo/searchUI"
      method="post"
      enctype="application/x-www-form-urlencoded"
    >
      <input type="text" id="geneval" value="" placeholder="Search by genes" />
      <input type="hidden" id="searchArgGenetargets" name="searchArg" />
      <button
        type="button"
        onclick="updateFieldAndSubmit('at.gene_target', 'searchArgGenetargets', 'searchFormGenes', 'geneval')"
      >
        Search
      </button>
    </form>
  </div>
</div>
```

#### [`UpdateFieldAndSubmit`](views/index.ejs) function

```js
function updateFieldAndSubmit(column_name, searchargid, formid, valueid) {
  // Get the value from the input field
  const newValue = document.getElementById(valueid).value;
  console.log(newValue);

  // Create the searchArg object (assuming it was initially set)
  let searchArg = {};
  // Get the current JSON string from the hidden input field if it exists
  const searchArgField = document.getElementById(searchargid);
  console.log(searchArgField.value);
  try {
    searchArg = JSON.parse(searchArgField.value) || {};
  } catch (e) {
    console.error('Error parsing searchArg:', e);
  }
  // Update the specific field in the searchArg object
  searchArg.val = newValue;
  searchArg.field = column_name;
  searchArg.op = 'contains';
  searchArg.limit = '25';
  searchArg.offset = '0';
  searchArg.orderfield = column_name;
  searchArg.order = 'ASC';
  searchArg.descendants = [];

  // Serialize the updated searchArg object and set it in the hidden input
  searchArgField.value = JSON.stringify(searchArg);

  // Submit the form
  document.getElementById(formid).submit();
}
```

#### [Stylesheet](public/css/style.css)

```css
.search-window {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.search-window .widget {
  margin-bottom: 20px;
}

.search-window h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.search-window form {
  margin-bottom: 20px;
}

.search-window input[type='text'] {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.search-window button {
  padding: 10;
}
```

After implementing the search fields, I observed that clicking the search button with the mouse functioned without any issues. However, initiating the search by pressing the Enter key resulted in an error indicating that the searchArg was invalid. To address this, I created an event listener for the Enter key on each button to properly handle the searchArg values and forward them correctly.

```js
function setupEnterKeyHandler(inputId, column_name, searchargid, formid) {
  document
    .getElementById(inputId)
    .addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission
        updateFieldAndSubmit(column_name, searchargid, formid, inputId);
      }
    });
}

window.addEventListener('DOMContentLoaded', (event) => {
  setupEnterKeyHandler(
    'cellval',
    'cell_name',
    'searchArgCells',
    'searchFormCells'
  );
  setupEnterKeyHandler(
    'compoundval',
    'at.pert_name',
    'searchArgCompounds',
    'searchFormCompounds'
  );
  setupEnterKeyHandler(
    'geneval',
    'at.gene_target',
    'searchArgGenetargets',
    'searchFormGenes'
  );
});
```

#### [Third column](views/index.ejs)

The third column was temporarily configured to include the TH-Bingen logo to test image display functionality. After confirming that the image displayed correctly, I began developing ideas for the contact page, which I will elaborate on later.

```js
 <div class="test-section">
        <p>
          <img
            src="data:image/png......"
            alt="Image TH-Bingen"
            width="300px"
          />
        </p>
      </div>
    </div>
```

#### [Stylesheet](public/css/style.css)

```js
.test-section p {
  margin: 12px 12px;
  padding: 5px 5px;
  position: absolute;
  right: 2px;
  border-radius: 12px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow */
}
```

Following this implementation, I created the contact page, which linked to our LinkedIn profiles and displayed our profile pictures using the same method as the TH-Bingen logo on the homepage. Additionally, the contact page included a brief description of our roles and tasks in the project. The about page provided a summary of the project presented as plain text.

#### [Contact](views/contact.ejs)

```js
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Contact Us</title>
    <link rel="stylesheet" href="/css/tablestyles.css" />
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <header>
      <nav class="navbar">
        <div class="container">
          <a href="/" class="logo">L1000</a>
          <ul class="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
          <div class="menu-toggle">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </div>
        </div>
      </nav>
    </header>

    <main>
      <section class="contact-section">
        <div class="container">
          <h1>Contact Us</h1>
        </div>
        <div class="contact-grid-container">
          <section class="about">
            <h1>Alexander Dürk</h1>
            <img
              src="data:image......."
              alt="About Image Alexander Dürk"
              width="300px"
            />
            <p>
              Text
            </p>
            <p>
            <a href="https://www.linkedin.com/in/alexanderduerk/?originalSubdomain=de" target="_blank">
            <img src="data:image/png;...."
              alt="About Image Daron Hakimian"
              width="300px"
            />
            <p>
              Text
            </p>
            <p>
            <a href="https://www.linkedin.com/in/daron-hakimian/" target="_blank">
            <img src="data:image/png;base64...." alt="LinkedIn" style="width: 24px; height: 24px;">
    </a>
            </p>
            <p>daron.hakimian@th-bingen.de</p>
          </section>
          <section class="about">
            <h1>Erik Dechant</h1>
            <img
              src="data:image/jpeg;base64...."
              alt="About Image Erik Dechant"
              width="300px"
            />
            <p>
              Text
            </p>
            <p>
            <a href="https://www.linkedin.com/in/erik-dechant-34114824a/?originalSubdomain=de/" target="_blank">
            <img src="data...." alt="LinkedIn" style="width: 24px; height: 24px;">
    </a>
</p>

            <p>erik.dechant@th-bingen.de</p>
          </section>
        </div>
      </section>
    </main>
  </body>
</html>
```

#### About Page

```js
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>About Us</title>
    <link rel="stylesheet" href="/css/tablestyles.css" />
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <header>
      <nav class="navbar">
        <div class="container">
          <a href="/" class="logo">L1000</a>
          <ul class="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
          <div class="menu-toggle">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </div>
        </div>
      </nav>
    </header>

    <main>
      <div class="container">
      <section class="about-ABPage">
        <p>
   Text
        </p>
      </section>
        </div>
      </section>
    </main>
  </body>
</html>

```

I was also involved in implementing the table display for the data on the website. This display was designed to show the UI version of the siginfo table with an option for users to switch to the full table, which includes 27 columns of data. Additionally, I developed a function using the forwardLink function to generate a searchArg for three specific columns—cells, genes, or compounds. This function directs each column to its respective full table and allows for a complex searchArg that supports searching based on two filtering inputs.

#### [Table interface](views/siginfo.ejs)

```js
<tbody>
    <% for (const row of data) { %>
      <tr>
        <% for (const [key, value] of Object.entries(row)) { %>
          <td>
            <% if (key === 'cell_name') { %>
              <a href="#" onclick="forwardLink('<%= value %>', 'cell_name', 'searchFormCells', 'searchArgCells')"><%= value %></a>
            <% } else if (key === 'pert_name') { %>
              <a href="#" onclick="forwardLink('<%= value %>', 'pert_name', 'searchFormPerts', 'searchArgPerts')"><%= value %></a>
            <% } else if (key === 'gene_target') { %>
              <a href="#" onclick="forwardLink('<%= value %>', 'gene_symbol', 'searchFormGenes', 'searchArgGenes')"><%= value %></a>
            <% } else { %>
              <%= value %>
            <% } %>
          </td>
        <% } %>
      </tr>
    <% } %>
  </tbody>
</table>
```

#### [`forwardLink`](views/siginfo.ejs) function and form

```js
function forwardLink(value, column_name, searchForm, searchArgID) {
  const searchArgField = document.getElementById(searchArgID);
  let searchArg = JSON.parse(searchArgField.value);
  searchArg.val = value;
  searchArg.field = column_name;
  searchArg.op = 'contains';
  searchArg.limit = '25';
  searchArg.offset = '0';
  searchArg.orderfield = column_name;
  searchArg.order = 'ASC';
  searchArg.descendants = [];
  console.log(JSON.stringify(searchArg));
  searchArgField.value = JSON.stringify(searchArg);
  document.getElementById(searchForm).submit();
}
```

#### [Form](views/siginfo.ejs)

```js
<form
      id="searchForm"
      action="/siginfo/searchUI"
      method="post"
    >
      <input type="hidden" id="searchArg" name="searchArg" value="<%= JSON.stringify(siteSearchArg) %>">
    </form>
    <form
      id="searchFormFull"
      action="/siginfo/search"
      method="post"
    >
      <input type="hidden" id="searchArgFull" name="searchArg" value="<%= JSON.stringify(siteSearchArg) %>">
    </form>
    <form id="searchFormCells" action="/cells/searchUI" method="post">
      <input type="hidden" id="searchArgCells" name="searchArg" value="<%= JSON.stringify(siteSearchArg) %>">
    </form>
    <form id="searchFormPerts" action="/perturbations/searchUI" method="post">
      <input type="hidden" id="searchArgPerts" name="searchArg" value="<%= JSON.stringify(siteSearchArg) %>">
    </form>
    <form id="searchFormGenes" action="/genes/searchUI" method="post">
      <input type="hidden" id="searchArgGenes" name="searchArg" value="<%= JSON.stringify(siteSearchArg) %>">
    </form>
  </div>
  </main>
</body>
```

#### [Full Window button](views/siginfo.ejs)

Additionally i created a `view full window` button that allowed the user to see the full 27 columns of the siginfo table.

```js
<div class="container">
    <button type="button" onclick="fullsearch()">Show full Table</button>
```

With the function [`fullsearch()`](views/siginfo.ejs) being:

```js
function fullsearch() {
  const searchArgField = document.getElementById('searchArgFull');
  let searchArg = JSON.parse(searchArgField.value);
  searchArgField.value = JSON.stringify(searchArg);
  document.getElementById('searchFormFull').submit();
}
```

#### [Stylesheet](public/css/tablestyles.css)

```css
main {
  justify-content: center;
  align-items: center;
}

.tableDiv {
  width: 100vw;
  max-width: 100vw;
  height: auto;
  align-items: center;
  justify-content: center;
}

table {
  border-radius: 12px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  width: 100%;
  height: 80vh;
  max-width: 100vw;
  margin: 0 auto;
  border-collapse: collapse;
  max-height: 80vh;
  position: relative;
  z-index: 0;
  table-layout: fixed;
}

thead {
  position: sticky;
  top: 0;
  z-index: 3;
  padding: 12px;
  border-radius: 12px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow */
}

th {
  /* Set vertical alignment to centered */
  text-align: center;
  width: auto;
  background-color: #333;
  color: white;
  font-size: 14px;
  /* position: sticky;
  top: 0;
  z-index: 1; */
}

td {
  padding: 10px 10px;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: auto;
}
```

Overall, it was a valuable experience for me to work on my first project involving three new programming languages and to learn a fresh approach to thinking and data interpretation. I’m grateful for this opportunity and would encourage others to acquire these skills as well.

-End of documentation-
