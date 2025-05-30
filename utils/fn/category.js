import { db } from '../db';
import generateId from '../generateId';
import { CATEGORIES_TABLE_NAME } from './initDB';

export const addCategory = (category) => {
    try {
        const id = category.id || generateId(); // Jika belum ada id, generate
        db.runSync(
            `INSERT INTO ${CATEGORIES_TABLE_NAME} (id, name, icon, color, type)
             VALUES (?, ?, ?, ?, ?)`,
            [id, category.name, category.icon, category.color, category.type]
        );
        return id;
    } catch (e) {
        console.error('Gagal menambahkan kategori:', e.message);
        throw e;
    }
};

export const getAllCategories = () => {
    try {
        return db.getAllSync(`SELECT * FROM ${CATEGORIES_TABLE_NAME}`);
    } catch (e) {
        console.error('Gagal mengambil kategori:', e.message);
        throw e;
    }
};

export const getCategoryById = (id) => {
    try {
        const result = db.getAllSync(`SELECT * FROM ${CATEGORIES_TABLE_NAME} WHERE id = ?`, [id]);
        return result.length > 0 ? result[0] : null;
    } catch (e) {
        console.error('Gagal mengambil kategori:', e.message);
        throw e;
    }
};

export const getCategoryByName = (name) => {
    try {
        const result = db.getAllSync(`SELECT * FROM ${CATEGORIES_TABLE_NAME} WHERE name = ?`, [name]);
        return result.length > 0 ? result[0] : null;
    } catch (e) {
        console.error('Gagal mengambil kategori:', e.message);
        throw e;
    }
};

export const getCategoriesByType = (type) => {
    try {
        return db.getAllSync(`SELECT * FROM ${CATEGORIES_TABLE_NAME} WHERE type = ?`, [type]);
    } catch (e) {
        console.error('Gagal memfilter kategori:', e.message);
        throw e;
    }
};


export const deleteCategory = (id) => {
    try {
        db.runSync(`DELETE FROM ${CATEGORIES_TABLE_NAME} WHERE id = ?`, [id]);
    } catch (e) {
        console.error('Gagal menghapus kategori:', e.message);
        throw e;
    }
};

export const editCategory = (id, updatedCategory) => {
    try {
        db.runSync(
            `UPDATE ${CATEGORIES_TABLE_NAME}
             SET name = ?, icon = ?, color = ?, type = ?
             WHERE id = ?`,
            [updatedCategory.name, updatedCategory.icon, updatedCategory.color, updatedCategory.type, id]
        );
    } catch (e) {
        console.error('Gagal mengedit kategori:', e.message);
        throw e;
    }
};