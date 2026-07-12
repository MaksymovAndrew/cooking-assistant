-- Up Migration

UPDATE unit_measurement SET unit_name = 'g' WHERE unit_name = 'gr';

-- Down Migration

UPDATE unit_measurement SET unit_name = 'gr' WHERE unit_name = 'g';