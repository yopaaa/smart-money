import { db } from '../db';
import generateId from '../generateId';

export const saveSetting = (key, value) => {
    try {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

        // Cek apakah key sudah ada
        const existing = db.getAllSync('SELECT id FROM settings WHERE key = ?', [key]);

        if (existing.length > 0) {
            // Key sudah ada, update value
            db.runSync('UPDATE settings SET value = ? WHERE key = ?', [valueStr, key]);
            console.log(`✅ Setting "${key}" berhasil diupdate`);
        } else {
            // Key belum ada, insert baru
            db.runSync(
                'INSERT INTO settings (id, key, value) VALUES (?, ?, ?)',
                [generateId(), key, valueStr]
            );
            console.log(`✅ Setting "${key}" berhasil disimpan`);
        }
    } catch (e) {
        console.error('❌ Gagal menyimpan setting:', e.message);
        throw e;
    }
};

export const getSetting = (key, parse = true) => {
    try {
        const result = db.getAllSync('SELECT value FROM settings WHERE key = ?', [key]);
        if (result.length > 0) {
            const val = result[0].value;            
            return parse ? tryParseJSON(val) : val;
        } else {
            return null;
        }
    } catch (e) {
        console.error('❌ Gagal mengambil setting:', e.message);
        return null;
    }
};

const tryParseJSON = (value) => {
    try {
        return JSON.parse(value);
    } catch (_) {
        return value;
    }
};
