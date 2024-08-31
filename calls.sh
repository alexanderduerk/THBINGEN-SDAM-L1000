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
 
# Extract the ID from the search response
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
 
# Use this JSON object in the curl request
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
 
  # Complex Search test
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
 
deleted_entry=$(curl -s -X DELETE "$base_url/$gene_id")
echo "Sucessfully deleted: $deleted_entry"

searchedGeneID=$(curl -s -X GET "http://localhost:3000/genes?id=1")
echo "Found Gene by ID 1: $searchedGeneID"
 
 
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
 
# Extract the ID from the search response
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
 
# Use this JSON object in the curl request
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
 
echo "Successfully updated Geneentry: $updated_entry"
 
  # Complex Search test
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
 
deleted_cellentry=$(curl -s -X DELETE "$cells_url/$cell_id")
echo "Sucessfully deleted: $deleted_cellentry"

searchedCellID=$(curl -s -X GET "http://localhost:3000/cells?id=1")
echo "Found Cell by ID 1: $searchedCellID"

 
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
 
# Extract the ID from the search response
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
 
# Use this JSON object in the curl request
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
 
  # Complex Search test
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
 
deleted_pertentry=$(curl -s -X DELETE "$pert_url/$pert_id")
echo "Sucessfully deleted: $deleted_pertentry"

searchedPertID=$(curl -s -X GET "http://localhost:3000/pertubations?id=1")
echo "Found Pertubation by ID 1: $searchedPertID"
 
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
 
# Use this JSON object in the curl request
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
 
# Extract the ID from the search response
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
 
# Use this JSON object in the curl request
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
 
  # Complex Search test
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
            "field": "si.cmap_name"}]
  }}')
 
echo "Sucessfully searched with descendants: $updated_sigcomplex"
 
sig_url="http://localhost:3000/siginfo"
 
deleted_sigentry=$(curl -s -X DELETE "$sig_url/$sig_id")
echo "Sucessfully deleted: $deleted_sigentry"

searchedSigInfoID=$(curl -s -X GET "http://localhost:3000/siginfo?id=1")
echo "Found Pertubation by ID 1: $searchedSigInfoID"
