# L1000 Dataset RESTful API

This repository contains a RESTful API built on Node.js using the Express framework. The API is designed to interact with the L1000 dataset from the Broad Institute, which includes data related to cells, genes, and perturbations. The API allows for creating, reading, updating, and deleting (CRUD) operations on these datasets, as well as advanced search capabilities.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the API](#running-the-api)
- [API Endpoints](#api-endpoints)
  - [Overview](#overview-1)
  - [Cells](#cells)
    - [Create a new cell record](#create-a-new-cell-record)
    - [Search cell records](#search-cell-records)
    - [Update a cell record](#update-a-cell-record)
    - [Delete a cell record](#delete-a-cell-record)
  - [Genes](#genes)
    - [Create a new gene record](#create-a-new-gene-record)
    - [Search gene records](#search-gene-records)
    - [Update a gene record](#update-a-gene-record)
    - [Delete a gene record](#delete-a-gene-record)
  - [Pertubations](#pertubations)
    - [Create a new pertubations record](#create-a-new-pertubations-record)
    - [Search pertubation records](#search-pertubation-records)
    - [Update a pertubation record](#update-a-pertubation-record)
    - [Delete a pertubation record](#delete-a-pertubation-record)
  - [Signature Info](#signature-info)
    - [Create a new signature infos record](#create-a-new-signature-infos-record)
    - [Search signature info records](#search-signature-info-records)
    - [Update a signature info record](#update-a-signature-info-record)
    - [Delete a signature info record](#delete-a-signature-info-record)
- [GUI-Guide](#gui-guide)
- [License](#license)

## Overview

The L1000 dataset API provides programmatic access to the data tables related to cell information, gene information, and perturbations. Users can perform CRUD operations and complex searches via a RESTful interface. This API is useful for bioinformatics research, data analysis, and integrating L1000 data into larger projects.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (v12.x or later)
- npm (Node package manager)
- SQLite3 (for database management)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-repo/l1000-api.git
   cd l1000-api
   ```
2. Install the required Node.js packages:
   ```bash
   npm install
   ```

### Database Setup

The API interacts with an SQLite database named l1000.db. Ensure this database is correctly set up and contains the necessary tables. For this you need to adjust the delivered [SQL-File](l1000.sql) by adding the full csv file paths for each table and run it afterwards.

### Running the API

To start the API server, run the following command:

```bash
node app.js
```

The server will start on http://localhost:3000.

## API Endpoints

### Overview

The API supports CRUD operations for the following entities: Cells, Genes, Perturbations, and Signature Info. Below is an overview of the endpoints.

| Endpoint           | HTTP Method | Description                              |
| ------------------ | ----------- | ---------------------------------------- |
| /cells             | POST        | Create a new cell record                 |
| /cells             | GET         | Search cell records                      |
| /cells/:id         | GET         | Retrieve a cell record by ID             |
| /cells             | PATCH       | Update an existing cell record           |
| /cells/:id         | DELETE      | Delete a cell record by ID               |
| /genes             | POST        | Create a new gene record                 |
| /genes             | GET         | Search gene records                      |
| /genes/:id         | GET         | Retrieve a gene record by ID             |
| /genes             | PATCH       | Update an existing gene record           |
| /genes/:id         | DELETE      | Delete a gene record by ID               |
| /perturbations     | POST        | Create a new perturbation record         |
| /perturbations     | GET         | Search perturbation records              |
| /perturbations/:id | GET         | Retrieve a perturbation record by ID     |
| /perturbations     | PATCH       | Update an existing perturbation record   |
| /perturbations/:id | DELETE      | Delete a perturbation record by ID       |
| /siginfo           | POST        | Create a new signature info record       |
| /siginfo           | GET         | Search signature info records            |
| /siginfo/:id       | GET         | Retrieve a signature info record by ID   |
| /siginfo           | PATCH       | Update an existing signature info record |
| /siginfo/:id       | DELETE      | Delete a signature info record by ID     |

### Cells

#### Create a new cell record

To create a new cell record in the database, send a POST request with the necessary cell details. The request body must be in JSON format and include fields such as cell_name, cellosaurus_id, donor_age, and other relevant information.

Example Request:

```bash
curl -s -X POST "http://localhost:3000/cells" \
  -H "Content-Type: application/json" \
  -d '{
  "cell_name":"CELLNAME",
  "cellosaurus_id":"CELLOSAURUS ID",
  "donor_age":10,
  "doubling_time":"10h",
  "growth_medium":"MEDIUM",
  "cell_type":"TESTTYPE",
  "donor_ethnicity":"CAUCASIAN",
  "donor_sex":"M",
  "donor_tumor_phase":"S4",
  "cell_lineage":"TESTLINEAGE",
  "primary_disease":"TESTDISEASE",
  "subtype_disease":"TESTSUBTYPE",
  "provider_name":"TESTPROVIDER",
  "growth_pattern":"TESTPATTERN"
}'
```

#### Search cell records

Cell records can be retrieved either by specifying a unique ID or by performing a more complex search using the searchArg parameter. The search allows for advanced filtering with multiple conditions, including the use of logical operators and ordering of results.

Search by ID:

Retrieve a specific cell record by providing its unique ID in the query string.

```bash
curl -s -X GET "http://localhost:3000/cells?id=ID"
```

Advanced Search:

Perform a complex search using multiple conditions. The request body should specify parameters like limit, offset, order, field, op, and val, along with any descendants for nested filtering.

```bash
curl -s -X POST "http://localhost:3000/cells/search" \
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
            "field": "cell_name"
            },
          {
            "op": "contains",
            "val": "T",
            "field": "growth_pattern"
            }
            ]
  }}'
```

#### Update a cell record

To update an existing cell record, send a PATCH request with the cell_id, the columnname to be updated, and the new value. The SQL database will be updated with the provided information.

Example Request:

```bash
curl -s -X PATCH "http://localhost:3000/cells" \
  -H "Content-Type: application/json" \
  -d '{
  "cellid": ID,
  "columnname": "cell_name",
  "newvalue": "UPDATED"
  }'
```

#### Delete a cell record

To delete a cell record, send a DELETE request with the specific ID of the cell record as a URL parameter. This operation will remove the record from the database.

Example Request:

```bash
curl -s -X DELETE "http://localhost:3000/cells/ID"
```

### Genes

#### Create a new gene record

To create a new gene record, send a POST request with the relevant gene details. The request body must be in JSON format and should include fields such as entrez_id, gene_symbol, ensembl_id, and other pertinent attributes.

Example Request:

```bash
curl -s -X POST "http://localhost:3000/genes" \
  -H "Content-Type: application/json" \
  -d '{
  "entrez_id":777777,
  "gene_symbol":"TEST1",
  "ensembl_id":"TEST2",
  "gene_title":"TEST3",
  "gene_type":"TEST4",
  "src":"TEST5",
  "feature_space":"TEST6"
}'
```

#### Search gene records

Gene records can be retrieved either by specifying a unique ID or by conducting a more advanced search using the searchArg parameter. The search functionality allows for complex filtering with multiple conditions, logical operators, and customizable result ordering.

Search by ID:

Retrieve a specific gene record by providing its unique ID in the query string.

```bash
curl -s -X GET "http://localhost:3000/genes?id=ID"
```

Advanced Search:

Conduct a detailed search using multiple filtering conditions. The request body should include parameters like limit, offset, order, field, op, and val, as well as any descendants for nested filtering.

```bash
curl -s -X POST "http://localhost:3000/genes/search" \
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
            "field": "gene_symbol"
            },
          {
            "op": "contains",
            "val": "histone",
            "field": "gene_title"
            }]
  }}'
```

#### Update a gene record

To update an existing gene record, send a PATCH request with the gene_id, the columnname to be updated, and the new value. This operation will modify the specified entry in the SQL database.

Example Request:

```bash
curl -s -X PATCH "http://localhost:3000/genes" \
  -H "Content-Type: application/json" \
  -d '{
  "geneid": GENEID,
  "columnname": "feature_space",
  "newvalue": "UPDATED"
  }'
```

#### Delete a gene record

To delete a gene record, send a DELETE request with the specific ID of the gene record as a URL parameter. This operation will remove the record from the database.

Example Request:

```bash
curl -s -X DELETE "http://localhost:3000/genes/ID"
```

### Pertubations

#### Create a new pertubations record

To create a new perturbation record, send a POST request with the necessary details. The request body must be formatted in JSON and should include fields such as pert_name, cmap_name, gene_target, and other relevant attributes.

Example Request:

```bash
curl -s -X POST "http://localhost:3000/perturbations" \
  -H "Content-Type: application/json" \
  -d '{
    "pert_name": "PERT123",
    "cmap_name": "CMAP123",
    "gene_target": "GENETARGET123",
    "moa": "TESTMOA",
    "canonical_smiles": "TEST",
    "inchi_key": "TESTKEY",
    "compound_aliases": "TESTALIAS"
}'
```

#### Search pertubation records

Perturbation records can be retrieved either by specifying a unique ID or by conducting an advanced search using the searchArg parameter. The search functionality supports complex filtering with multiple conditions, logical operators, and customizable result ordering.

Search by ID:

Retrieve a specific perturbation record by providing its unique ID in the query string.

```bash
curl -s -X GET "http://localhost:3000/perturbations?id=ID"
```

Advanced Search:

Conduct a detailed search using multiple filtering conditions. The request body should include parameters such as limit, offset, order, field, op, and val, along with any descendants for nested filtering.

Example Request:

```bash
curl -s -X POST "http://localhost:3000/perturbations/search" \
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
            "field": "pert_name"
            },
          {
            "op": "contains",
            "val": "CMAP123",
            "field": "cmap_name"
            }
            ]
  }}'
```

#### Update a pertubation record

To update an existing perturbation record, send a PATCH request with the pert_id, the column to be updated, and the new value. The SQL database will be updated with the provided information.

```bash
curl -s -X PATCH "http://localhost:3000/perturbations" \
  -H "Content-Type: application/json" \
  -d '{
  "pertid": ID,
  "column": "pert_name",
  "newvalue": "UPDATED"
  }'
```

#### Delete a pertubation record

To delete a perturbation record, send a DELETE request with the specific ID of the record as a URL parameter. This operation will remove the record from the database.

```bash
curl -s -X DELETE "http://localhost:3000/perturbations/ID"
```

### Signature Info

#### Create a new signature infos record

To create a new signature info record, send a POST request with the relevant details. The request body must be formatted in JSON and should include fields such as sig_name, pert_name, cmap_name, cell_name, and other specific attributes related to the signature.

```bash
curl -s -X POST "http://localhost:3000/siginfo" \
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
}'
```

#### Search signature info records

Signature info records can be retrieved either by specifying a unique ID or by conducting an advanced search using the searchArg parameter. The search functionality supports complex filtering with multiple conditions, logical operators, and customizable result ordering.

Search by ID:

Retrieve a specific signature info record by providing its unique ID in the query string.

```bash
curl -s -X GET "http://localhost:3000/siginfo?id=ID"
```

Advanced Search:

Conduct a detailed search using multiple filtering conditions. The request body should include parameters like limit, offset, order, field, op, and val, along with any descendants for nested filtering.

Example Request:

```bash
curl -s -X POST "http://localhost:3000/siginfo/search" \
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
            "field": "pert_name"
            },
          {
            "op": "contains",
            "val": "CMAP123",
            "field": "cmap_name"
            }
            ]
  }}'
```

#### Update a signature info record

To update an existing signature info record, send a PATCH request with the sig_name, the column to be updated, and the new value. This operation will modify the specified entry in the SQL database.

```bash
curl -s -X PATCH "http://localhost:3000/siginfo" \
  -H "Content-Type: application/json" \
  -d '{
  "sig_name": ID,
  "column": "sig_name",
  "newvalue": "UPDATED"
  }'
```

#### Delete a signature info record

To delete a signature info record, send a DELETE request with the specific ID of the record as a URL parameter. This operation will remove the record from the database.

```bash
curl -s -X DELETE "http://localhost:3000/siginfo/ID"
```

# GUI-Guide

Our GUI is designed to facilitate efficient data retrieval from the L1000 dataset, providing a user-friendly interface. It includes three distinct search fields to query the database by cell type, compound, or target gene. The resulting table is fully customizable, allowing users to sort columns in ascending or descending order via header column buttons. Hovering over the information icons ('i') displays additional details about the data in each column.

Search fields support precise filtering. Text-based columns use a "contains" operator for any input, while value-based columns allow operators such as >, <, <=, and >=. These operators can be applied sequentially, with each step requiring confirmation via the "Search" button or the Enter key.

The page limit and pagination (Page/Offset) can be adjusted at the bottom of the interface. The "Show Full Table" button at the top provides access to the complete 'siginfo' table, bypassing any pre-filtering. Additionally, the "Plot" button navigates to a new page displaying two downloadable plots, generated using the current search parameters and set limit, along with the associated data.

# License

This project is licensed under the MIT License. See the LICENSE file for details.
