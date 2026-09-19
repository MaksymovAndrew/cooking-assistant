-- Up Migration

UPDATE unit_measurement SET unit_name = 'L' WHERE unit_name = 'l';

-- Down Migration

UPDATE unit_measurement SET unit_name = 'l' WHERE unit_name = 'L';
