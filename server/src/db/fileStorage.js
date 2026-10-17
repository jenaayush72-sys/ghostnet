import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadCollection(filename) {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return new Map();
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const items = JSON.parse(raw);
    const map = new Map();
    if (Array.isArray(items)) {
      for (const item of items) {
        const id = filename.includes('evidence')
          ? (item.evidenceId || item.id || item.caseId)
          : (item.caseId || item.evidenceId || item.id);
        if (id) map.set(id, item);
      }
    }
    return map;
  } catch (err) {
    console.warn(`[FileStorage] Notice: Could not read ${filename} (${err.message}). Starting with empty store.`);
    return new Map();
  }
}

let saveTimers = new Map();

export function saveCollection(filename, map) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    const items = Array.from(map.values());
    // Write atomically via temporary file to prevent corruption
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(items, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`[FileStorage] Error saving ${filename}:`, err.message);
  }
}
