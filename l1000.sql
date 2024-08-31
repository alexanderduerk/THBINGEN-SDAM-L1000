-- Create a Cells table

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

CREATE TABLE IF NOT EXISTS cells (
    cell_id INTEGER PRIMARY KEY AUTOINCREMENT,  -- THE PRIMARY KEY SHOULD AUTOINCREMENT A INTEGER FOR EVERY ENTRY
    cell_name VARCHAR(30) NOT NULL,  -- THE CURATED NAME FOR THE CELLLINE IT SHOULDNT BE LONGER THEN 30 CHARACTERS AND SHOULDNT BE 0 WE WILL NOT ADD A UNIQUE CONSTRAIN BECAUSE DIFERENT ADAPTIONS TO GROWTH MEDIA COULD BE POSSIBLE
    cellosaurus_id VARCHAR(20), -- THIS WOULD ALLOW TO SEARCH THE CELL WITHIN THE CELLOSAURUS ENCYCLOPEDIA
    donor_age FLOAT, -- CONTAINS THE AGE OF THE DONOR AS AN FLOAT BECAUSE OF YOUNG DONORS UNDER A YEAR
    doubling_time VARCHAR(10), -- CONTAINS THE DOUBLING TIME WHICH COULD BE RANGES OR CONNECTED TO AN OPERATOR LIKE > or <
    growth_medium VARCHAR(60), -- SOME MEDIA COULD HAVE COMPLEX NAMES
    cell_type VARCHAR(20) NOT NULL, -- CONTAINS HIGH LEVEL INFORMATION OF CELL STATUS FOR EXAMPLE TUMOR
    donor_ethnicity VARCHAR(20), -- ETHNIC AS STRING COULD BE THOUGHT OF TO BE CHANGED TO A CONSTRAINT INPUT TYPE
    donor_sex VARCHAR(1), -- DONOR SEX CAN ONLY BE M OR F
    donor_tumor_phase VARCHAR(20), -- COULD MAYBE ALSO BE CHANGED TO A INTEGER APPROACH TO SAVE SOME SPACE
    cell_lineage VARCHAR(20), -- GIVES INFORMATION ABOUT THE TISSUE
    primary_disease VARCHAR(30), -- PRIMARY DISEASE COULD BE BREAST CANCER FOR EXAMPLE
    subtype_disease VARCHAR(30), -- GIVES MORE INFORMATION ABOUT THE DISEASE E.G. ADENOCARCINOMA
    provider_name VARCHAR(30), -- A PROVIDER SHOULD BE SAVED EVERY TIME TO ALLOW PROPER RESULT REPRODUCTION BASED ON DATA
    growth_pattern VARCHAR(20) NOT NULL, -- THIS COULD MAYBE TO CHANGED TO SOME INTEGER APPROACH, IT IS IMPORTANT TO SAVE THE GRWOTH PATTERN BECAUSE THE SAME CELL LINE COULD BE ADAPTED TO DIFFERENT GROWTH CONDITIONS
    UNIQUE(cell_name, cell_type, growth_pattern) ON CONFLICT IGNORE -- SIMPLE CONSTRAIN TO CHECK IF THE COMBINATION OF THE NOT NULL COLUMNS ALREADY EXISTS IN OUR DATABASE AND IF SO IGNORES THE INCOMING INPUT REQUEST
)

CREATE TABLE IF NOT EXISTS genes (
    gene_id INTEGER PRIMARY KEY AUTOINCREMENT,
    entrez_id INTEGER UNIQUE NOT NULL ON CONFLICT IGNORE,
    gene_symbol VARCHAR(30) NOT NULL ON CONFLICT IGNORE,
    ensembl_id VARCHAR(30),
    gene_title VARCHAR(30),
    gene_type VARCHAR(30),
    src VARCHAR(20),
    feature_space VARCHAR(30)
)

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

CREATE TABLE IF NOT EXISTS tempsignature_infos (
    sig_name VARCHAR(50) UNIQUE NOT NULL,
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
    project_code VARCHAR(20)
)

CREATE TABLE IF NOT EXISTS tempcells (
    cell_name VARCHAR(30) NOT NULL,  -- THE CURATED NAME FOR THE CELLLINE IT SHOULDNT BE LONGER THEN 30 CHARACTERS AND SHOULDNT BE 0 WE WILL NOT ADD A UNIQUE CONSTRAIN BECAUSE DIFERENT ADAPTIONS TO GROWTH MEDIA COULD BE POSSIBLE
    cellosaurus_id VARCHAR(20), -- THIS WOULD ALLOW TO SEARCH THE CELL WITHIN THE CELLOSAURUS ENCYCLOPEDIA
    donor_age FLOAT, -- CONTAINS THE AGE OF THE DONOR AS AN FLOAT BECAUSE OF YOUNG DONORS UNDER A YEAR
    doubling_time VARCHAR(10), -- CONTAINS THE DOUBLING TIME WHICH COULD BE RANGES OR CONNECTED TO AN OPERATOR LIKE > or <
    growth_medium VARCHAR(60), -- SOME MEDIA COULD HAVE COMPLEX NAMES
    cell_type VARCHAR(20) NOT NULL, -- CONTAINS HIGH LEVEL INFORMATION OF CELL STATUS FOR EXAMPLE TUMOR
    donor_ethnicity VARCHAR(20), -- ETHNIC AS STRING COULD BE THOUGHT OF TO BE CHANGED TO A CONSTRAINT INPUT TYPE
    donor_sex VARCHAR(1), -- DONOR SEX CAN ONLY BE M OR F
    donor_tumor_phase VARCHAR(20), -- COULD MAYBE ALSO BE CHANGED TO A INTEGER APPROACH TO SAVE SOME SPACE
    cell_lineage VARCHAR(20), -- GIVES INFORMATION ABOUT THE TISSUE
    primary_disease VARCHAR(30), -- PRIMARY DISEASE COULD BE BREAST CANCER FOR EXAMPLE
    subtype_disease VARCHAR(30), -- GIVES MORE INFORMATION ABOUT THE DISEASE E.G. ADENOCARCINOMA
    provider_name VARCHAR(30), -- A PROVIDER SHOULD BE SAVED EVERY TIME TO ALLOW PROPER RESULT REPRODUCTION BASED ON DATA
    growth_pattern VARCHAR(20) NOT NULL, -- THIS COULD MAYBE TO CHANGED TO SOME INTEGER APPROACH, IT IS IMPORTANT TO SAVE THE GRWOTH PATTERN BECAUSE THE SAME CELL LINE COULD BE ADAPTED TO DIFFERENT GROWTH CONDITIONS
    UNIQUE(cell_name, cell_type, growth_pattern) ON CONFLICT IGNORE -- SIMPLE CONSTRAIN TO CHECK IF THE COMBINATION OF THE NOT NULL COLUMNS ALREADY EXISTS IN OUR DATABASE AND IF SO IGNORES THE INCOMING INPUT REQUEST
)

CREATE TABLE IF NOT EXISTS tempgenes (
    entrez_id INTEGER UNIQUE NOT NULL ON CONFLICT IGNORE,
    gene_symbol VARCHAR(30) NOT NULL ON CONFLICT IGNORE,
    ensembl_id VARCHAR(30),
    gene_title VARCHAR(30),
    gene_type VARCHAR(30),
    src VARCHAR(20),
    feature_space VARCHAR(30)
)

CREATE TABLE IF NOT EXISTS tempperturbagens (
    pert_name VARCHAR(30) NOT NULL, -- A Code for a pertubagen
    cmap_name VARCHAR(30),                            -- The internal (CMap-designated) name of a perturbagen
    gene_target VARCHAR(30),                               -- The symbol of the gene that the compound targets
    moa VARCHAR(30),                                  -- Curated phrase representing the compound's mechanism of action
    canonical_smiles VARCHAR(100),                     -- Canonical SMILES structure
    inchi_key VARCHAR(30),                            -- InChIKey - hashed version of the InChi identifier
    compound_aliases VARCHAR(30),                     -- Alternative name for the compound
    UNIQUE(pert_name, gene_target, moa) ON CONFLICT IGNORE
    --FOREIGN KEY (gene_target)
    --    REFERENCES genes (gene_symbol)
) 

.mode csv
.import Users/path/to/siginfo.csv tempsignature_infos
.import Users/path/to/cellinfo.csv tempcells
.import Users/path/to/genes.csv tempgenes
.import Users/path/to/compounds.csv tempperturbagens

INSERT INTO signature_infos ('sig_name', 'pert_name', 'cmap_name', 'pert_type', 'cell_name', 'bead_batch', 'pert_dose', 'pert_time', 'nsamples', 'cc_q75', 'ss_ngene', 'tas', 'pct_self_rank_q25', 'wt', 'median_recall_rank_spearman', 'median_recall_rank_wtcs_50', 'median_recall_score_spearman', 'median_recall_score_wtcs_50', 'batch_effect_tstat', 'batch_effect_tstat_pct', 'is_hiq', 'qc_pass', 'det_wells', 'det_plates', 'distil_ids','project_code') SELECT * FROM tempsignature_infos

INSERT INTO cells('cell_name', 'cellosaurus_id', 'donor_age', 'doubling_time', 'growth_medium', 'cell_type', 'donor_ethnicity', 'donor_sex', 'donor_tumor_phase', 'cell_lineage', 'primary_disease', 'subtype_disease', 'provider_name', 'growth_pattern') SELECT * FROM tempcells

INSERT INTO genes ('entrez_id', 'gene_symbol', 'ensembl_id', 'gene_title', 'gene_type', 'src', 'feature_space') SELECT * FROM tempgenes

INSERT INTO perturbagens ('pert_name', 'cmap_name', 'gene_target', 'moa', 'canonical_smiles', 'inchi_key', 'compound_aliases') SELECT * FROM tempperturbagens

DROP TABLE tempsignature_infos;
DROP TABLE tempcells;
DROP TABLE tempgenes;
DROP TABLE tempperturbagens;
