CREATE TABLE gender (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    parent              INTEGER, -- references gender.id
    child_order         INTEGER NOT NULL DEFAULT 0,
    description         TEXT
);

CREATE TABLE language (
    id                  SERIAL PRIMARY KEY,
    iso_code_2t         CHAR(3), -- ISO 639-2 (T)
    iso_code_2b         CHAR(3), -- ISO 639-2 (B)
    iso_code_1          CHAR(2), -- ISO 639
    name                VARCHAR(100) NOT NULL,
    frequency           INTEGER NOT NULL DEFAULT 0,
    iso_code_3          CHAR(3)  -- ISO 639-3
);
