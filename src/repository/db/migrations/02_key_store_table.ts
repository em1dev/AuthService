import { Migration } from './types';

export const createKeyStoreTable: Migration = {
  id: '02_create_key_store_table',
  command: async (db) => {
    await db.run(`
      CREATE TABLE IF NOT EXISTS keyStore (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        publicKey TEXT NOT NULL,
        privateKey TEXT NOT NULL,
        created_at NUMBER NOT NULL
      );
    `);
  }
};
