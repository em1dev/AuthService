import jose from 'jose';

class KeyStore {
  private _publicKey: null | CryptoKey = null;
  private _privateKey: null | CryptoKey = null;

  public getKeys = async () => {
    if (this._publicKey == null || this._privateKey == null) {
      await this.refreshKeys();
    }
    return {
      publicKey: this._publicKey!,
      privateKey: this._privateKey!
    };
  };

  public refreshKeys = async () => {
    const { privateKey, publicKey } = await jose.generateKeyPair('PS256', { extractable: true });
    console.log('Refreshed private keys');
    this._privateKey = privateKey;
    this._publicKey = publicKey;
  };
}

export const keyStore = new KeyStore();
