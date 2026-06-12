import { db } from './db';
import { Tables } from './types';


const getKeys = async () => {
    interface KeyPair {
      publicKey: string,
      privateKey: string,
    }

    const keys = await db.get<KeyPair>(`
      SELECT(1) id, publicKey, privateKey, created_at
      FROM ${Tables.keyStore}
    `);

    return keys;
};

const updateKeys = async (publicKey: string, privateKey: string) => {
  const createdAt = Date.now();
  await db.run(`
    DELETE FROM ${Tables.keyStore}
  `);

  await db.run(`
      INSERT INTO ${Tables.keyStore} (publicKey, privateKey, created_at)
      VALUES ($publicKey, $privateKey, $createdAt);
  `, { $publicKey: publicKey, $privateKey: privateKey, $createdAt:createdAt });
};

export const keyStoreRepository = {
  getKeys,
  updateKeys
};
