import jose from 'jose';
import { keyStoreRepository } from '../repository/keyStoreRepository';
import { decrypt, encrypt } from '../encryption';

const ALG = 'PS256';

class KeyStore {
  private _publicKey: null | CryptoKey = null;
  private _privateKey: null | CryptoKey = null;

  public getKeys = async () => {
    if (this._publicKey != null && this._privateKey != null) {
      return {
        publicKey: this._publicKey,
        privateKey: this._privateKey
      };
    }

    const dbKeys = await keyStoreRepository.getKeys();
    if (dbKeys) {
      console.log('Loaded encryption keys from db');
      const exportedPublicKey = decrypt(dbKeys.publicKey);
      const exportedPrivateKey = decrypt(dbKeys.privateKey);

      this._publicKey = await jose.importSPKI(exportedPublicKey, ALG);
      this._privateKey = await jose.importPKCS8(exportedPrivateKey, ALG);
    } else {
      await this.refreshKeys();
    }

    return {
      publicKey: this._publicKey!,
      privateKey: this._privateKey!
    };
  };

  public refreshKeys = async () => {
    const { privateKey, publicKey } = await jose.generateKeyPair(ALG, { extractable: true });
    console.log('Refreshed encryption keys');

    const exportedPublicKey = await jose.exportSPKI(publicKey);
    const exportedPrivateKey = await jose.exportPKCS8(privateKey);

    const encryptedPublicKey = encrypt(exportedPublicKey);
    const encryptedPrivateKey = encrypt(exportedPrivateKey);

    await keyStoreRepository.updateKeys(encryptedPublicKey, encryptedPrivateKey);

    this._privateKey = privateKey;
    this._publicKey = publicKey;
  };
}

export const keyStore = new KeyStore();
