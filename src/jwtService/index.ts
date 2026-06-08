import { generateKeyPair, SignJWT, jwtVerify } from 'jose';
import { InternalError } from '../errors';
import { TokenUser } from '../types';
import { Config } from '../config';

export const keyStore: {
  publicKey: null | CryptoKey,
  privateKey: null | CryptoKey
} = {
  publicKey: null,
  privateKey: null
};

const keyGeneration = async () => {
  const { privateKey, publicKey } = await generateKeyPair('PS256', { extractable: true });
  console.log('Generated new keys');
  keyStore.privateKey = privateKey;
  keyStore.publicKey = publicKey;
};

keyGeneration();

export const createToken = async (user: TokenUser, audience: string) => {
  if (!keyStore.privateKey || !keyStore.publicKey) {
    throw new InternalError('keys not generated yet');
  }

  const jwt = await new SignJWT({
    ...user
  })
    .setProtectedHeader({
      alg: 'PS256'
    })
    .setIssuedAt()
    .setIssuer(Config.TOKEN_ISSUER)
    .setAudience(audience)
    .setExpirationTime('1week')
    .sign(keyStore.privateKey);

  return jwt;
};

export const verifyToken = async (token: string) => {
  if (!keyStore.privateKey || !keyStore.publicKey) {
    throw new InternalError('keys not generated yet');
  }

  try {
    const payload = await jwtVerify(token, keyStore.publicKey, { issuer: Config.TOKEN_ISSUER });
    return payload.payload;
  } catch {
    return null;
  }
};
