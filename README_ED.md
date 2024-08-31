This README tries to explain the toughts while programming and how myself was able to solve problems and think about certain challenges. It therefore should show what part of the project i was working on and what ideas led to the decision making.

# SQL Table Perturbagens

We began by determining how to structure the data models based on the L1000 dataset, leading to the creation of several tables as defined in the [l1000.sql file](l1000.sql). The siginfos table was chosen as the main table, as it serves as the central reference point for the other tables created, including `perturbagens`, `cells`, `genes`, and `siginfos`.

## Creation of Perturbagens Table

The `perturbagens` table was designed to store detailed information about chemical compounds, referred to as perturbagens. The primary key, `pert_id`, is an auto-incrementing identifier (not displayed in the final dataset). The `pert_name` is the unique identifier within the dataset for each perturbagen. The table also includes a foreign key `gene_target`, which links to the `genes` table via the `gene_symbol`.

```sql
CREATE TABLE perturbagens (
    pert_id INTEGER PRIMARY KEY AUTOINCREMENT,                      -- A unique identifier/counter for a perturbagen
    pert_name VARCHAR(30) NOT NULL, -- A Code for a pertubagen
    cmap_name VARCHAR(30),                            -- The internal (CMap-designated) name of a perturbagen
    gene_target VARCHAR(30),                               -- The symbol of the gene that the compound targets
    moa VARCHAR(30),                                  -- Curated phrase representing the compound's mechanism of action
    canonical_smiles VARCHAR(100),                     -- Canonical SMILES structure
    inchi_key VARCHAR(30),                            -- InChIKey - hashed version of the InChi identifier
    compound_aliases VARCHAR(30),                     -- Alternative name for the compound
    UNIQUE(pert_name, gene_target, moa) ON CONFLICT IGNORE,
    FOREIGN KEY (gene_target)
        REFERENCES genes (gene_symbol)
)
```

The `canonical_smiles` field will later be formatted into a molecular structure images in [perts.ejs](perts.ejs).

## Perturbagens Table in SQL

TA temporary table, `tempperturbagens`, was created to facilitate the insertion of relevant data from the L1000 CSV files into the database. Data was first imported into `tempperturbagens` and then transferred to the predefined columns in the `perturbagens` table. Once the data transfer is complete, the `tempperturbagens` table can be dropped, as it is no longer needed.

# Queres to databse

## Perturbagens class

The file [pertubations.js file](pertubations.js) contains the definition of the `Perturbagens class`, which is used to interact with the `perturbagens` table in the database.

### Defining Data for the pertubations table:

The following code defines a JavaScript class `Perturbagens` to represent the data model for the `perturbagens` table. It includes various attributes relevant to a perturbagen.

```js
/**
 * Datamodel defines all data for the pertubations table
 */
/**
 * Represents a pertubation with various attributes
 */
class Perturbagens {
  /**
   * Constructor for the cellinfos class
   * @param {HashMap} keyValuePairs - Attributes and their values
   */
  constructor(keyValuePairs) {
    const expectedTypes = {
      pert_name: 'string',
      cmap_name: 'string',
      gene_target: 'string',
      moa: 'string',
      canonical_smiles: 'string',
      inchi_key: 'string',
      compound_aliases: 'string',
    };
```

### Dynamic Property Assignment

The following code ensures that each property in the object is assigned a value from `keyValuePairs` only if it matches the expected type. It then sets those properties on the current object.

```js
    // use a dymaic constructor approach
    Object.keys(keyValuePairs).forEach((key) => {
      checkType(keyValuePairs[key], expectedTypes[key]);
      this[key] = keyValuePairs[key];
    });
  }
```

This approach provides a robust mechanism for interacting with the `perturbagens table`, ensuring data integrity and consistency within the application.

### CreateOne

A function was implemented to insert new entries into the database. This function dynamically constructs an SQL query by extracting all columns and their corresponding values from the instance, ensuring that the insertion process is adaptable to any changes in the data model.

```js
  /**
   * Write Function for inserting the instance into the db
   * @param {instance}
   */

  async createOne(dbconnection) {
    // get all columns
    const columns = Object.keys(this);
    // get all values
    const values = Object.values(this);
    // define the placeholders
    const placeholders = columns.map(() => '?').join(',');
    // define sql statement
    const sql = `INSERT INTO perturbagens (${columns.join(',')}) VALUES (${placeholders})`;
    // Execute SQL statement with the instanced values
    const dbres = await dbconnection.run(sql, ...values);
    // return the newly inserted cell
    const newpertid = await dbconnection.get(
      `SELECT * FROM perturbagens WHERE pert_name = ?`,
      this.pert_name
    );
    return newpertid;
  }
```

### DeleteOne

To enhance the flexibility of database operations, a delete function was created to remove a perturbagen based on its pert_id, which is the auto-incremented primary key. It is important to note that, due to the auto-increment feature, the primary key (pert_id) persists even after deletion, and the IDs do not re-adjust.

```js
/**
   * Delete Function for the pert_id table
   * @param {dbconnection, pert_id}
   */
  // sql statement
  static async deleteOne(dbconnection, pertid) {
    const sql = `DELETE FROM perturbagens WHERE pert_id = ?`;
    const dbres = await dbconnection.run(sql, `${pertid}`);
    // return a console.log that the given pertubagens was deleted
    console.log(`Perturbagens with pert_id: ${pertid} was deleted`);
  }
```

### UpdateOne

This method was designed to update a specific row in the `perturbagens` table based on a given `pert_id`. The update will assign a new value to the specified column. As with the `deleteOne` method, the `pert_id` remains unique and unchanged, and the updated entry retains the same `pert_id`.

```js
/**
   * Updates a single row in the "compound" table with the given id, column, and new value
   *
   * @param {object} dbconnection - The database connection object.
   * @param {number} id - The id of the row to update.
   * @param {string} column - The column to update.
   * @param {any} newvalue - The new value to set.
   * @return {Promise<object>} - A Promise that resolves to the updated row.
   */
  /**
   * Update/Patch Function for pert_id table
   * @param {dbconnection, pert_id, column, newvalue}
   */
  static async updateOne(dbconnection, pertid, column, newvalue) {
    const sql = `UPDATE perturbagens SET ${column} = ? WHERE pert_id = ${pertid}`;
    const dbres = await dbconnection.run(sql, newvalue);
    // return a console.log that the given pertubagens was updated
    console.log(`Pertubagens with ${pertid} was updated`);
    const updatedPerturbagens = await dbconnection.get(
      'SELECT * FROM perturbagens WHERE pert_id = ?',
      pertid
    );
    return updatedPerturbagens;
  }
```

### Search

The `search function` enables querying the database based on a provided search argument. If a `searcharg` is provided (i.e., it is not undefined or null), it utilizes the `translateToSQL` method from the `searchArg` object to generate a SQL query that filters the `perturbagens` table accordingly. If no `searcharg` is provided, the function defaults to selecting all rows from the `perturbagens table`. Additionally, `offset` and `limit` parameters are employed to facilitate pagination and control the number of results returned.

```js
static async search(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'perturbagens')
        : 'SELECT * FROM perturbagens';
    console.log(
      `SQL generated to search Compounds:\n${JSON.stringify(searchSql)}`
    );
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    console.log(dbResult);
    return dbResult;
  }
```

### SearchUI

The `searchUI` method is designed to construct and execute an SQL query that retrieves data from the `perturbagensUI` table in the User Interface. If no search argument is provided, the method defaults to a query that selects all rows from the `perturbagens table`. The generated SQL query and the results of the database query are logged for debugging purposes before returning the results, thereby enabling search functionality in the User Interface

```js
  static async searchUI(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'perturbagensUI')
        : 'SELECT * FROM perturbagens';
    console.log(
      `SQL generated to search Compounds:\n${JSON.stringify(searchSql)}`
    );
    console.log(
      `SQL generated to search Compounds:\n${JSON.stringify(searchSql)}`
    );
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    console.log(dbResult);
    return dbResult;
  }
```

### get by ID

he `readById` method allows for the retrieval of a specific compound from the `perturbagens table` using its unique pertid. This function is crucial for scenarios where a precise lookup by primary key is required.

```js
  static async readById(id, dbconnection) {
    console.log(id);
    const sql = 'SELECT * FROM perturbagens WHERE pert_id = ?';
    const dbres = await dbconnection.get(sql, id);
    console.log(dbres);
    return dbres;
  }
}
```

# Express.js server applications

The following section provides an overview of a complete Express.js server application that includes various RESTful API endpoints for managing data related to perturbagens information. The server interacts with an SQLite database using the `sqlite3` library.

## app.post(`/perturbations`)

This endpoint allows users to create a new record in the `Perturbagens` table in SQLite database as defined in the [l1000.sql file](l1000.sql).

The `req.body` object is used to create a new instance for the `Pertubations class` from [pertubations.js file](pertubations.js) file. The `createOne()` method is then called on this instance to insert the record into the database, with the newly assigned `pertid` returned as a response.

```js
// Post Function Pertubations
app.post('/perturbations', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');
    // Log the request body to check its contents
    console.log('Request Body:', req.body);
    // Create a new instance of the Pertubagens class
    const Perturbagensinstance = new Perturbagens(req.body);
    // Call Create One on the instance
    const newperdid = await Perturbagensinstance.createOne(db);
    console.log(`Created new Perturbagens record:`);
    console.log(newperdid);
    res.json(newperdid);
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

## app.post(`/perturbations/search`)

To facilitate searches within the `Perturbagens` table, a search endpoint was created. The `searchArg` is retrieved as a JSON string from the request body, parsed into an object, and used to construct the SQL query.

```js
/**
 * Search Request for the Pertubations table
 */
app.post('/perturbations/search', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;

  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const compounds = await Perturbagens.search(
      searchArg,
      searchArg.limit,
      searchArg.offset,
      db
    );
    console.log(`Found compounds:`);
    console.log(compounds);
```

The `ejs.renderFile()` function is then utilized to render the HTML page [perts.ejs file](perts.ejs) by injecting the `compounds` data as an object, enabling the requested data to be displayed in the response.

```js
    // Return the result:
    if (req.accepts('html')) {
      ejs.renderFile(
        './views/perts.ejs',
        { data: compounds },
        {},
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      res.json(compounds);
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

## app.post(`/perturbations/searchUI`)

An additional endpoint was created to handle UI-related search queries. Similar to the previous search endpoint, the `searchArg` JSON string is extracted from the request body, parsed, and used to perform the database search.

```js
/**
 * Search Request for the Pertubations table
 */
app.post('/perturbations/searchUI', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;

  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const compounds = await Perturbagens.searchUI(
      searchArg,
      searchArg.limit,
      searchArg.offset,
      db
    );

    console.log(`Found compounds:`);
    console.log(compounds);
```

The results are again rendered using `ejs.renderFile()` to integrate the retrieved `compound data` into the User Interface, as implemented in the previous search endpoint.

```js
    // Return the result:
    if (req.accepts('html')) {
      ejs.renderFile(
        './views/perts.ejs',
        { data: compounds },
        {},
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      res.json(compounds);
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

## app.delete(/pertubations)

This endpoint was developed to delete an entry from the `Perturbagens` table based on a provided `pertid`, which is extracted from the request body.

```js
// Delete Pertubations
app.delete('/pertubations', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');

    // Extract the pert_id from the request body
    const { pertid } = req.body;
    console.log('Request Body:', req.body);
```

The `deleteOne` function from the [pertubations.js file](pertubations.js) file is invoked to delete the database entry corresponding to the extracted `pertid`.

```js
    // Call deleteOne function
    await Perturbagens.deleteOne(db, pertid);
    console.log(`Deleted Pertubagens record with pert_id: ${pertid}`);
    res.status(200).send(`Deleted Pertubagens record with pert_id: ${pertid}`);
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

## app.patch(/pertubations)

The `PATCH` method was implemented to allow partial updates to existing records in the `perturbagens` table. This method is particularly useful when you need to update a specific field or set of fields within a record, rather than replacing the entire record as the `PUT` method would require.

```js
// Patch pertubations
app.patch(`/pertubations`, async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: `./l1000.db`,
      driver: sqlite3.Database,
    });
    console.log(`Connected successfully`);

    // Extract the pert_id to be updated from request body
    const { pertid, column, newvalue } = req.body;

    // Validate input
    if (!pertid || !column || newvalue === undefined) {
      return res.status(400).send('Bad request: Missing fields');
    }

    const updatedPerturbagens = Perturbagens.updateOne(
      db,
      pertid,
      column,
      newvalue
    );
    // Send a success response
    res.status(200).send(`Updated pertubagens record with pert_id: ${pertid}`);
    console.log('Updated Pert record:');
    console.log(updatedPerturbagens);
    res.json(updatedPerturbagens);
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

### Key Considerations

Key Considerations:
`PATCH vs. PUT:` The PATCH method is chosen over PUT due to its flexibility in updating individual fields within a record. PUT would require the entire record to be sent in the request body, which would overwrite the existing record entirely. PATCH allows for more targeted updates, reducing the risk of accidental data loss.

`Validation:` The input is validated to ensure that the pertid, column, and newvalue are provided. If any of these are missing, a 400 Bad Request response is returned.

## app.get(/pertubations)

Here the `http` method `PATCH` was used, instead of the recommended `PUT` method to create an endpoint that listens for http `PATCH` request sent to [pertubations.js file](pertubations.js).
The decision was supported by the fact that it allows editing single columns of the requested pertid data entry, making it more flexible for dynamical editing. Additionally `PUT` method requires the whole column entry to be sent in the request, because it overwrites the entries.

```js
// Compounds Get function
app.get('/genes', async (req, res) => {
  let db;
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    const geneid = req.query.id; // Extract the isg ID from the URL
    const gene = await Genes.readById(geneid, db); // Call the readById function
    res.json(gene);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving gene');
  } finally {
    if (db) {
      await db.close();
    }
  }
});
```

# User Interface

The User Interface of [perts.ejs file](perts.ejs) is encoding the User Interface appearence of the `Compounds` table after searching on the mainpage encoded in [index.ejs file](index.ejs). In the main table now `genetarget` for example can be selected as target to point to the compound table, where the SMILE structure is present as well.

## Perturbagens Table UI

The User Interface for displaying the `Perturbagens` table is defined in the [perts.ejs file](perts.ejs) file. This file renders the search results and displays them in a structured table format. The table is styled using the `tablestyle.css` file to maintain a consistent appearance across the application.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>L1000</title>
    <link rel="stylesheet" href="/css/tablestyles.css" />
    <link rel="stylesheet" href="/css/style.css" />
  </head>
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
  </body>
</html>
```

### Key UI Elements

`Navbar:` A navigation bar that provides quick access to the home page, about page, and contact page.

`Compound Table:` The core element of the perts.ejs file, displaying the search results in a tabular format. The table includes columns for ID, Name, SMILES, and Gene Target, among others.

```html
<main>
  <% if (data && data.length > 0) { %>
  <table>
    <thead>
      <tr>
        <!--Hardcoded header for SMILES Structure visualisation-->
        <th>Name of reagent</th>
        <th>Gene Target</th>
        <th>Mechanism of action</th>
        <th>Structure</th>
        <th>Compound Aliases</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</main>
```

## SMILES structures

n the `Compound` table, one datatype is the `SMILES` key, which represents the compound's structure used for perturbation. Since the `SMILES` key as a plain string is not user-friendly, we enhanced the user interface by converting these keys into hoverable 2D images of the compounds' structures using a GitHub library. The relevant code can be found in the [perts.ejs file](perts.ejs) file.

When querying the database, the `Canonical-SMILES` data is rendered as <img> elements rather than displaying the SMILES key as a string.

```html
        </thead>
        <tbody>
          <% for (const row of data) { %>
            <tr>
              <% for (const [key, value] of Object.entries(row)) { %>
                <td>
                    <% if (key === 'canonical_smiles') { %>
            <img class="smilesstructure" data-smiles="<%= value %>"
             alt="Molecule">
          <% } else { %>
            <%= value %>
              <% } %>
                </td>
            <% } %>
            </tr>
          <% } %>
        </tbody>
      </table>
    <% } else { %>
      <p>No data available</p>
    <% } %>
  </main>
    <script
      type="text/javascript"
      src="https://unpkg.com/smiles-drawer@2.0.1/dist/smiles-drawer.min.js"
    ></script>
    <script>
      SmiDrawer.apply();
    </script>
</body>
```

## Interactive SMILES Structure Design

To enhance the visibility of the `SMILES` key, a hover function was implemented to allow interactive zooming on the compound structure. This functionality is defined in the [tablestyles.css file](tablestyles.css) file, which sets an initial image size and enlarges it on hover, along with applying a highlight effect to the `SMILES` images.

```css
td img {
  width: 50px;
  height: 50px;
}

td img:hover {
  transform: scale(5); /* Increase size by 20% */
  transition: transform 0.3s ease; /* Add smooth transition */
  border: 2px solid #ccc;
  background-color: whitesmoke;
}
```

# Plotting Functionality

For flexible data analysis on the website, JavaScript was chosen over Python due to its faster performance, which is crucial given the large volume of entries in the database. This choice helps mitigate server response times when generating plots. The graphs displayed upon clicking the `plot button` illustrate the response for a unique `sig_id` associated with a `perturbation`. They visualize the transcriptional activation score and the `ss_ngenes`, which denote the number of dysregulated genes in the perturbation experiment. Plots are downloadable, and users can access the raw data for further analysis.

The plots will reflect the criteria specified in the search and adhere to the limits set in the main table.

## app.post(plots)

To receive the created plots again an API endpoint was created at [plots.ejs file](plots.ejs).

```js
app.post('/plots', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);
```

The `searchArg` values are parsed from a JSON string into an object. It is crucial for the plot function that the `searchArg` object includes the limit for the number of data points plotted. Additionally, the values in the current search are important to ensure that only the requested data is used in the plots and the corresponding server-generated CSV.

The `offset` parameter, representing pagination, is also important to ensure the data plotted corresponds to the current page, thus avoiding confusion when downloading the data or reviewing the plots.

```js
  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
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

    console.log(`Found signatures:`);
    console.log(signatures);
    // Return the result:
    if (req.accepts('html')) {
      res.render(
        'plots.ejs',
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

### Vsualising Plots

n the [plots.ejs file](plots.ejs) file, the plotting functionality has been implemented to visualize data. To maintain a consistent design, the page layout was reused. Additionally, the Chart.js library was incorporated to facilitate chart creation and visualization. Styling was applied through the [styles.css file](styles.css) file to streamline the page design.

```js
<html>
  <!-- L1000 bar -->
  <head>
    <!-- L1000 title -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>L1000</title>
    <!-- Chartjs library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>

  <!-- link to stylesheet for div -->

    <link rel="stylesheet" href="/css/styles.css" />
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
       <!-- L1000 Style -->
      </head>
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

### Chart Layout and Functionality

To create a consistent visual design, a `chart-container` class was used for styling charts, and a `chart-buttons` class was applied to style the buttons for each chart. The `chart-button` allows users to download the chart data as a CSV file, while the `download-image-button` enables downloading the chart as a PNG image. Each chart also includes a description for clarity.

```html
<!-- First myChart1-->
<div class="chart-container">
  <canvas id="myChart1" class="Chart"></canvas>
  <div class="chart-buttons">
    <button
      class="chart-button"
      onclick="downloadData(myChart1, xValues1, yValues1)"
    >
      <!-- Download function for csv file chart1-->
      Download Data
    </button>
    <!-- Download function for Chartimage-->
    <button id="download-image" onclick="DownloadChart(myChart1)">
      Download Chart
    </button>
  </div>
  <div class="chart-text">
    <p>
      This Chart provides information about the siginfo name and the correlating
      tas values (Contains all limit hits)
    </p>
  </div>
</div>
```

The same was performed with `myChart2` which is the second and last chart displayed when searching.

```html
    <!-- Second myChart2 -->
  <div class = "chart-container">
    <canvas id="myChart2" class="Chart"></canvas>
    <div class = "chart-buttons">
    <button class="chart-button" onclick="downloadData(myChart2, xValues2, yValues2)"
    >
    Download Data

    <!-- Dowload chart as image mychart2-->
    <button id="download-image" onclick="DownloadChart(myChart2)">
        Download Chart
    </button>
    </div>
    <div class= "chart-text">
      <p>This Chart provides information about the siginfo name and the number of genes which are changed (Contains all limit hits)</p>
    </div>
  </div>
```

To facilitate the plotting, the data for both charts is stored in hidden input fields. JavaScript accesses these values to generate the charts using the Chart.js library.

```html
<form>
  <input type="hidden" id="data1" value="<%= JSON.stringify(data) %>" />
  <input type="hidden" id="data2" value="<%= JSON.stringify(data) %>" />
</form>
```

## JavaScript for Plotting Chart Data

With help of the W3 schools Tutorial for bar Charts [https://www.w3schools.com/ai/ai_chartjs.asp] the basic code structure was written for creating charts and handle requested data. It was also a function implemented to display the data when hovering over the bar charts.
Data are also sorted `ascending` to make the data easier to analyse by eye, when requesting the chart.

The `toBase64Image` method is used to convert the chart to a base64 image, enabling users to download the chart as a PNG file.

```html
    <script>
      // First chart data
      const rawData1 = document.getElementById('data1').value;
      const data1 = JSON.parse(rawData1);

      const xValues1 = [];
      const yValues1 = [];

      // Sort data by tas values in ascending order for first
      data1.sort((a, b) => a.tas - b.tas);

      for (const row of data1) {
        xValues1.push(row.sig_name); // Using sig_name for better label variety
        yValues1.push(row.tas); // Keeping tas as y-axis values
      }

      let myChart1 = new Chart(
        document.getElementById('myChart1').getContext('2d'),
        {
          type: 'bar',
          data: {
            labels: xValues1, // X-axis labels from sig_name array
            datasets: [
              {
                label: 'TAS',
                data: yValues1, // Y-axis data from tas array
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              x: {
                type: 'category', // X-axis is categorical
              },
              y: {
                beginAtZero: true, // Start y-axis at 0
                // Get a download function for this plot from chartjs in browser
                animation: {
                  onComplete: function () {
                    console.log(myChart.toBase64Image());
                  },
                },
              },
            },
          },
        }
      );
<scirpt>
```

Same coding strategy was implemented into the second chart data code.

```html
<script>
      // Second chart data
      const rawData2 = document.getElementById('data2').value;
      const data2 = JSON.parse(rawData2);

      const xValues2 = [];
      const yValues2 = [];

      // Sort and populate data for the second chart
      data2.sort((a, b) => a.ss_ngene - b.ss_ngene);
      for (const row of data2) {
        xValues2.push(row.sig_name);
        yValues2.push(row.ss_ngene);
      }

      // Create the second chart
      let myChart2 = new Chart(document.getElementById('myChart2').getContext('2d'),
      {
        type: 'bar',
        data: {
          labels: xValues2,
          datasets: [
            {
              label: 'ss_ngene',
              data: yValues2,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: 'category'
            },
            y: {
               beginAtZero: true,
               animation: {
                onComplete: function () {
                  console.log(myChart.toBase64Image());
                },
               },
              },
          },
        },
      });

      const charts = document.querySelectorAll('canvas');
<script>
```

### Enhancing Chart Interactivity

To improve chart visibility, a hover function was implemented to enlarge the chart on `mouse enter` and revert to the original size on `mouse leave`.
It was also neccessary to implement a initial size as the size of the mouse leave format.

```html
<script>
      charts.forEach((chart) => {
        // Set initial width and height (replace 50% with your desired size)
        chart.style.width = '50%';
        chart.style.height = '50%';

        chart.addEventListener('mouseenter', () => {
          chart.style.width = '100%'; // Increase width to 75% on hover
          chart.style.height = '100%'; // Increase height to 75% on hover
        });
        chart.addEventListener('mouseleave', () => {
          chart.style.width = '50%'; // Reset width to 100% on mouse leave
          chart.style.height = '50%'; // Reset height to 100% on mouse leave
        });
      });
<script>
```

### Chart Image and CSV Download

The previous meantioned Download chart Image function was now implemented.
Here the chartID of the canvas will be converted to a `toBase64image()` to enable the download by implementing an anchor element `a`, with `document.createElement`.

```html
<script>
      function DownloadChart(ChartId) {
        // create a pseudo link
        let a = document.createElement('a');
        // set href of corresponding plot to href
        a.href = ChartId.toBase64Image();
        // define a download name
        a.download = 'Chart.png';
        // Trigger the download
        a.click();
      }
<script>
```

The CSV data download functionality is implemented using a JavaScript function that generates a CSV file from chart plotting data. This is achieved through the creation of a pseudo-link that triggers the download of the generated CSV file. The download file name is dynamically generated based on the chart ID to ensure uniqueness.

```html
<script>
      // NEW GET THE .CSV FILE
      function downloadData(chartId, xValues, yValues) {
        // Prepare CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        // Add headers
        csvContent += "Label,Value\n";
        // Add data rows
        for (let i = 0; i < xValues.length; i++) {
          csvContent += `${xValues[i]},${yValues[i]}\n`;
        }
        // Create a pseudo link
        let a = document.createElement('a');
        // Encode CSV content and set as link href
        a.href = encodeURI(csvContent);
        // Define the download name based on chartId
        a.download = `${chartId.id}_data.csv`;
        // Trigger the download
        a.click();
      }
    </script>
  </body>
</html>

```

### Plot Buttons Maintable

The actual `Plot-Button` is coded in [siginfo.ejs file](siginfo.ejs), which is also the main table.

```html
<body>
    <button type="button" onclick="PlotCells()">Show Plots</button>
  </div>
 <main>
```

The "Show Plots" button is implemented in the [siginfo.ejs file](siginfo.ejs). Clicking this button triggers the PlotCells() function, which handles the plotting of data. The plotCells form in this file uses hidden input fields to pass searchArg data for further processing.

```html
<!-- Button for Cells plotting-->
<form id="plotCells" action="/plots" method="post">
  <input type="hidden" id="searchArgPlots" name="searchArg" value="<%= JSON.stringify(siteSearchArg) %>">
</form>
    <script
src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js">
</script>
</html>
```

### CSS Design for Plotting

First `chart-container` and `button-container` were encoded in css to put them on the right site of the chart container canvas elements.

```css
/* styles.css */

/* Container to hold both canvas and buttons */
.chart-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

/* Style for the buttons */
.chart-buttons {
  display: flex;
  flex-direction: column; /* Stack the buttons vertically */
  margin-left: 20px; /* Add some space between the canvas and the buttons */
}
```

The chart text was formated as well to look more conform with the homogenious design of the User Interface.
This was also performed for the general page appearance again as before in the tables, by adding L1000 bar.

```css
.chart-text {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* L100 Styles */
.l1000 {
  margin: 0;
  padding: 0;
  font-family: 'Roboto';
  width: 100vw;
  overflow-x: hidden;
  position: relative; /* Establishes a containing block for sticky positioning */
  padding-top: 5px; /* Adjust if needed to accommodate sticky header height */
}
```

# Tooltips

Tooltips were generated on each table page that is displayed in the User Interface.
Therefore every `.ejs` file was accessed to code the tooltips to every column header.

Tooltips were necessairy to encode the cryptic table headers used in the l1000 databse and to describe the displayed values to a user with no background about this project.

## Tooltips `siginfofull.ejs`

[sigininfofull.ejs file](siginfofull.ejs) - the maintable tooltips codes are displayed below.

For an overview the <th> are shown.
The tooltips were hardcoded in the order of the presented table headers.

```html
 </th>
          <th>Compound</th>
          <th>Connectivity Map Code</th>
          <th>Cells</th>
          <th>Bead batch</th>
          <th>Perturbation Dose</th>
          <th>Perturbation Time</th>
          <th>Number of samples</th>
          <th>cc_q75</th>
          <th>Modulated Genes</th>
          <th>Transcriptional Activity Score</th>
          <th>pct_self_rank_q25</th>
          <th>wt</th>
          <th>median_recall_rank_spearman</th>
          <th>median_recall_rank_wtcs_50</th>
          <th>median_recall_score_spearman</th>
          <th>median_recall_score_wtcs_50</th>
          <th>batch_effect_tstat</th>
          <th>batch_effect_tstat_pct</th>
          <th>High Quality Data</th>
          <th>Quality Control passed</th>
          <th>det_wells</th>
          <th>det_plates</th>
          <th>distil_ids</th>
          <th>project_code</th>
        </tr>
        <tr class="tooltip-row">
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">This is the name of the signature.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">This is the name of the compound used to perturbate.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">The internal (CMap-designated) name of a perturbagen. By convention, for genetic perturbations CMap uses the HUGO gene symbol.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">The cell type used in the experiment.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">One instantiation of a complete set of beads, which have been coupled to probes at one time, under the same conditions.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">The dose of the compound applied.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">The duration for which the cells were exposed to the compound.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">Number of individual replicate profiles (level 4 / z-score) that were used to create the signature (level 5 / aggregate z-score).</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">75th quantile of pairwise spearman correlations in landmark space of replicate level 4 profiles.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">
             Number of Genes that were differentially expressed in response to the compound.
            </span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">Score representing the transcriptional activity.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">Self connectivity of replicates expressed as a percentage of total instances in a replicate set.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">Comma-delimited list of the replicate weightings used to collapse into the level 5 signature. These will sum to 1.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">The median pairwise recall rank by spearman correlation between replicate level 4 profiles.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">The median pairwise recall rank by weighted connectivity score between replicate level 4 profiles.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">The median pairwise spearman correlation between replicate level 4 profiles.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">The median pairwise weighted connectiity score between replicate level 4 profiles.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">The result of a one-sample t-test comparing the median correlation between signatures from the same plate to 0. Higher values indicate higher correlations between such signatures, and hence potentially a batch effect.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">The percentile of batch_effect_tstat relative to all other signatures.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">Binary indicating whether the given signature was of high techincal and functional quality. Specific requirements are qc pass = 1 AND (median_recall_rank_spearman <= 5 OR median_recall_rank_wtcs_50 <= 5)</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext"> Binary indicating whether the given signature had at least 50% of its replicates flagged as qc_pass.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">Pipe-delimited list of detection wells, which refers to each well of the detection plate in which an L1000 experiment is conducted.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">Pipe-delimited list of detection plates, the plate of L1000 experiments that, at the end of the assay pipeline, is put through the Luminex scanners to detect the levels of landmark gene amplicons.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">Pipe-delmited list of IDs of individual replicate profiles, referred to as level 4 / z-score data, that is used in creating the signature from replicates assayed together on an L1000 plate. The signature is referred to as level 5 / aggregated z-score data.</span></span>
          </th>
          <th>
            <span class="tooltip">ⓘ<span class="tooltiptext">An internal code identifying the project to which a signature belongs.</span></span>
          </th>
        </tr>
```

### css effect design

[tablefull.css file](tablefull.css) was refered in [siginfofull.ejs file](siginfofull.ejs) where the Tooltip container effects were designed for the fulltable, which is just displaying the full table after clicking the `Full table Button`. The function of this button was not encoded by myself therfore it will not be meantioned in the further context.

Code for positioning, Text-layout and appearance as well as z-index, so the text will be visible is shown below.

```css
/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  cursor: pointer;
  color: grey;
  font-weight: bold;
  margin-left: 5px;
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  max-width: 100px; /* Adjust as needed to fit within column width */
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 5px 10px;
  position: absolute;
  z-index: 1000000; /* High z-index to ensure tooltip appears above other elements */
  top: 125%; /* Position below the icon */
  left: 50%;
  transform: translateX(-50%); /* Center the tooltip */
  margin-left: 0; /* Reset margin-left since we use transform for centering */
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 9px;
  overflow: hidden; /* Prevents the text from spilling out of the tooltip */
  white-space: normal; /* Allows text to wrap within the tooltip */
  word-wrap: break-word; /* Ensures long words break and wrap within the tooltip */
}
```

Now the hover function was implemented to show the text only when entering the tooltip with the mouse, as well as the vanishing of the tooltip after leaving.

Design for the box were the description of the tooltip is contained is also presented in the code shown below, as well as centering the text, tooltip-symbol and container in the individual columns.

```css
/* Tooltip arrow */
.tooltip .tooltiptext::after {
  content: '';
  position: absolute;
  bottom: 100%; /* Position the arrow above the tooltip */
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent black transparent; /* Arrow color and direction */
}

/* Show the tooltip text when hovering */
.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

/* Styling for the tooltip row */
.tooltip-row {
  background-color: #f9f9f9; /* Optional background color for the tooltip row */
  height: 1px; /* Adjust height as needed */
}

.tooltip-row th {
  text-align: center;
  padding: 0;
  vertical-align: bottom;
}
```

## tooltips `siginfo.ejs`

[Siginfo.ejs file](Siginfo.ejs) contains all the tooltips in the maintable.
The code is shown below and not further explained because it´s basic structure is the same as previously.

```html
class="tooltip-row">
<th>
  <span class="tooltip"
    >ⓘ
    <span class="tooltiptext hyphenate"
      >This is the name of the signature.</span
    ></span
  >
</th>
<th>
  <span class="tooltip"
    >ⓘ<span class="tooltiptext hyphenate"
      >This is the name of the compound used to perturbate.</span
    ></span
  >
</th>
<th>
  <span class="tooltip"
    >ⓘ<span class="tooltiptext hyphenate"
      >The gene that the compound targets.</span
    ></span
  >
</th>
<th>
  <span class="tooltip"
    >ⓘ<span class="tooltiptext hyphenate"
      >The cell type used in the experiment.</span
    ></span
  >
</th>
<th>
  <span class="tooltip"
    >ⓘ<span class="tooltiptext hyphenate"
      >The dose of the compound applied.</span
    ></span
  >
</th>
<th>
  <span class="tooltip"
    >ⓘ<span class="tooltiptext hyphenate"
      >The duration for which the cells were exposed to the compound.</span
    ></span
  >
</th>
<th>
  <span class="tooltip"
    >ⓘ<span class="tooltiptext hyphenate">
      Number of Genes that were differentially expressed in response to the
      compound.</span
    ></span
  >
</th>
<th>
  <span class="tooltip"
    >ⓘ<span class="tooltiptext hyphenate"
      >Score representing the transcriptional activity.</span
    ></span
  >
</th>
<th>
  <span class="tooltip"
    >ⓘ<span class="tooltiptext hyphenate"
      >Binary indicating whether the given signature was of high techincal and
      functional quality. Specific requirements are qc pass = 1 AND
      (median_recall_rank_spearman <= 5 OR median_recall_rank_wtcs_50 <=
      5)</span
    ></span
  >
</th>
<th>
  <span class="tooltip"
    >ⓘ<span class="tooltiptext hyphenate"
      >Binary indicating whether the given signature had at least 50% of its
      replicates flagged as qc_pass.</span
    ></span
  >
</th>
```

and again from css side.

```css
/* Tooltip arrow */
.tooltip .tooltiptext::after {
  content: '';
  position: absolute;
  bottom: 100%; /* Position the arrow above the tooltip */
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent black transparent; /* Arrow color and direction */
}

/* Show the tooltip text when hovering over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
```
