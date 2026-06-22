import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Absolute filesystem path to the local dev SQLite file (cms/data/tunadao.db).
// dirname here is cms/src/lib → ../../data/tunadao.db === cms/data/tunadao.db
export const LOCAL_DB_FILE = path.resolve(dirname, '../../data/tunadao.db');

// libSQL client URL form for the same file.
export const LOCAL_DB_URL = `file:${LOCAL_DB_FILE}`;
