const { type } = require('express/lib/response');

let typemapper;

// Create a lookup table of the cellsinfo columns and their types
const cellinfotypes = {
  cell_name: 'text',
  cellosaurus_id: 'text',
  donor_age: 'number',
  donor_age_death: 'number',
  donor_disease_onset: 'number',
  doubling_time: 'number',
  growth_medium: 'text',
  cell_type: 'text',
  donor_ethnicity: 'text',
  donor_sex: 'text',
  donor_tumor_phase: 'text',
  cell_lineage: 'text',
  primary_disease: 'text',
  subtype_disease: 'text',
  provider_name: 'text',
  growth_pattern: 'text',
};

const perturbagentypes = {
  pert_name: 'text',
  cmap_name: 'text',
  gene_target: 'text',
  moa: 'text',
  canonical_smiles: 'text',
  inchi_key: 'text',
  compound_aliases: 'text',
};

const genetypes = {
  entrez_id: 'number',
  gene_symbol: 'text',
  ensembl_id: 'text',
  gene_title: 'text',
  gene_type: 'text',
  src: 'text',
  feature_space: 'text',
};

const siginfotypes = {
  sig_name: 'text',
  pert_name: 'text',
  cmap_name: 'text',
  pert_type: 'text',
  cell_name: 'text',
  bead_batch: 'text',
  pert_dose: 'text',
  pert_time: 'text',
  nsamples: 'number',
  cc_q75: 'number',
  ss_ngene: 'number',
  tas: 'number',
  pct_self_rank_q25: 'number',
  wt: 'text',
  median_recall_rank_spearman: 'number',
  median_recall_rank_wtcs_50: 'number',
  median_recall_score_spearman: 'number',
  median_recall_score_wtcs_50: 'number',
  batch_effect_tstat: 'number',
  batch_effect_tstat_pct: 'number',
  is_hiq: 'boolean',
  qc_pass: 'boolean',
  det_wells: 'text',
  det_plates: 'text',
  distil_ids: 'text',
  project_code: 'text',
};

const geneinfotypes = {
  sig_name: 'text',
  gene_target: 'text',
  pert_name: 'text',
  cmap_name: 'text',
  pert_type: 'text',
  cell_name: 'text',
  bead_batch: 'text',
  pert_dose: 'text',
  pert_time: 'text',
  nsamples: 'number',
  cc_q75: 'number',
  ss_ngene: 'number',
  tas: 'number',
  pct_self_rank_q25: 'number',
  wt: 'text',
  median_recall_rank_spearman: 'number',
  median_recall_rank_wtcs_50: 'number',
  median_recall_score_spearman: 'number',
  median_recall_score_wtcs_50: 'number',
  batch_effect_tstat: 'number',
  batch_effect_tstat_pct: 'number',
  is_hiq: 'boolean',
  qc_pass: 'boolean',
  det_wells: 'text',
  det_plates: 'text',
  distil_ids: 'text',
  project_code: 'text',
};

/**
 * Determines if a field is of type text.
 *
 * @param {string} field - The field to check.
 * @return {boolean} - True if the field is of type text, false otherwise.
 */
function isTextField(field) {
  const fieldType = typemapper[field];
  console.log(typemapper[field]);
  return fieldType === 'text';
}

/**
 * Escapes a value for SQL based on its type.
 *
 * @param {any} value - The value to escape.
 * @param {boolean} isText - True if the value is of type text, false otherwise.
 * @return {string} - The escaped value.
 */
function escapeValue(value, isText) {
  if (isText) {
    // Implement proper escaping for text values
    return `'${value}'`;
  }
  return value;
}

/**
 * Translates a search triplet to SQL.
 *
 * @param {Object} triplet - The search triplet containing field, op, and val.
 * @param {string} triplet.field - The field to search on.
 * @param {string} triplet.op - The operator to use for the search.
 * @param {string} triplet.val - The value to search for.
 * @return {string} The SQL query string.
 * @throws {Error} If the operator is unsupported.
 */
function translateSearchTripletToSQL(triplet) {
  const isText = isTextField(triplet.field);
  const escapedVal = escapeValue(triplet.val, isText);
  switch (triplet.op) {
    case 'contains':
      return `${triplet.field} LIKE '%${triplet.val}%'`;
    case 'startswith':
      return `${triplet.field} LIKE '${triplet.val}%'`;
    case 'endswith':
      return `${triplet.field} LIKE '%${triplet.val}'`;
    case '=': // or any other default operator
      return `${triplet.field} = ${escapedVal}`;
    case '!=':
      return `${triplet.field} != ${escapedVal}`;
    case '>':
      return `${triplet.field} > ${escapedVal}`;
    case '<':
      return `${triplet.field} < ${escapedVal}`;
    case '>=':
      return `${triplet.field} >= ${escapedVal}`;
    case '<=':
      return `${triplet.field} <= ${escapedVal}`;
    case 'in':
      return `${triplet.field} IN (${escapedVal})`;
    case 'notin':
      return `${triplet.field} NOT IN (${escapedVal})`;
    default:
      throw new Error(`Unsupported operator: ${triplet.op}`);
  }
}

/**
 * Recursively translates a search argument to SQL.
 *
 * @param {object} searchArg - The search argument to translate.
 * @return {string} The translated SQL string.
 */
function translateToSQLRecursive(searchArg) {
  console.log('Received searchArg:', JSON.stringify(searchArg)); // Log to check structure

  // Check if searchArg.descendants is an array
  if (
    Array.isArray(searchArg.descendants) &&
    searchArg.descendants.length > 0
  ) {
    const descSqlArr = searchArg.descendants.map((descendant) => {
      console.log('Processing descendant:', JSON.stringify(descendant)); // Log each descendant

      if (Array.isArray(descendant.descendants)) {
        return translateToSQLRecursive(descendant);
      }

      if (
        descendant.field &&
        descendant.op &&
        (descendant.value || descendant.val)
      ) {
        return translateSearchTripletToSQL(descendant);
      } else {
        console.error('Invalid descendant:', descendant);
        return ''; // Handle invalid descendant
      }
    });

    // Join the SQL parts with the operator specified in searchArg
    return `( ${descSqlArr.filter(Boolean).join(` ${searchArg.op || 'AND'} `)} )`;
  }

  // Check if searchArg is a valid search triplet
  if (searchArg.field && searchArg.op && (searchArg.value || searchArg.val)) {
    return translateSearchTripletToSQL(searchArg);
  }

  console.error('Invalid search argument:', searchArg);
  return ''; // Or throw an error
}

/**
 * Translates a search argument into an SQL query string.
 *
 * @param {Object} searchArg - The search argument to translate.
 * @param {string} table - The table to search in.
 * @return {string} The SQL query string.
 */
function translateToSQL(searchArg, table) {
  let header;
  // Create a header (for every cellname the same)
  if (table === 'cells') {
    header = `SELECT * FROM ${table} WHERE `;
    typemapper = cellinfotypes;
  }
  if (table === 'cellsUI') {
    header = `SELECT cell_name, donor_age, doubling_time, growth_medium, donor_ethnicity, donor_sex, donor_tumor_phase, primary_disease, growth_pattern FROM cells WHERE `;
    typemapper = cellinfotypes;
  }
  if (table === 'perturbagens') {
    header = `SELECT * FROM ${table} WHERE `;
    typemapper = perturbagentypes;
  }
  if (table === 'perturbagensUI') {
    header = `SELECT pert_name, gene_target, moa, canonical_smiles, compound_aliases FROM perturbagens WHERE `;
    typemapper = perturbagentypes;
  }
  if (table === 'genes') {
    header = `SELECT * FROM ${table} WHERE `;
    typemapper = genetypes;
  }
  if (table === 'genesUI') {
    header = `SELECT gene_symbol, ensembl_id, gene_title, gene_type, src, 
    feature_space FROM genes WHERE `;
    typemapper = genetypes;
  }

  if (table === 'signature_infos') {
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
    typemapper = siginfotypes;
  }
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

  // Use translateToSQLRecursive to handle nested queries
  const searchSql = translateToSQLRecursive(searchArg);
  let orderClause = '';
  orderClause = ` ORDER BY ${searchArg.orderfield} ${searchArg.order || 'ASC'}`;
  // Allow for pagination args if provided in the search
  if (searchArg.offset !== undefined && searchArg.limit !== undefined) {
    return `${header} ${searchSql}${orderClause} LIMIT ${searchArg.limit} OFFSET ${searchArg.offset}`;
  }

  // Combine both
  return `${header} ${searchSql} ${orderClause}`;
}
module.exports = { translateToSQL };
