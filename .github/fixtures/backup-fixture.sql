PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE backup_smoke (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO backup_smoke (id, name) VALUES (1, 'alpha');
INSERT INTO backup_smoke (id, name) VALUES (2, 'beta');
INSERT INTO backup_smoke (id, name) VALUES (3, 'gamma');
COMMIT;
