import { SignJWT, jwtVerify } from 'jose';
import { TokenUser } from '../types';
import { Config } from '../config';
import { keyStore } from './keyStore';

export const createToken = async (user: TokenUser, audience: string) => {
  const { privateKey } = await keyStore.getKeys();

  const jwt = await new SignJWT({ ...user })
    .setProtectedHeader({
      alg: 'PS256'
    })
    .setIssuedAt()
    .setIssuer(Config.TOKEN_ISSUER)
    .setAudience(audience)
    .setExpirationTime('1week')
    .sign(privateKey);

  return jwt;
};

export const verifyToken = async (token: string) => {
  const { publicKey } = await keyStore.getKeys();

  try {
    const payload = await jwtVerify(token, publicKey, { issuer: Config.TOKEN_ISSUER });
    return payload.payload;
  } catch {
    return null;
  }
};
