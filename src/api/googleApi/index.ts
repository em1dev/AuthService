import { URLSearchParams } from 'url';
import { ChannelInformationResponse, GoogleRefreshTokenResponse, GoogleTokenResponse } from './types';
import { logger } from '../../logger';

const getYoutubeChannel = async (
  token: string
) =>
{
  const params = new URLSearchParams({
    part: 'status,id,snippet',
    mine: 'true',
  });
  const url = 'https://www.googleapis.com/youtube/v3/channels?' + params.toString();
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!resp.ok)
    return;

  const data = await resp.json() as ChannelInformationResponse;
  return data.items.at(0);
};

const authenticateCode = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
) => {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri
  });
  const url = 'https://oauth2.googleapis.com/token?' + params.toString();

  const resp = await fetch(url, {
    method: 'POST'
  });

  if (!resp.ok) {
    console.log(await resp.text());
    return;
  }

  return await resp.json() as GoogleTokenResponse;
};

const refreshToken = async (
  refreshToken: string,
  clientId: string,
  clientSecret: string,
) =>
{
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });
  const url = 'https://oauth2.googleapis.com/token?' + params.toString();

  const resp = await fetch(url, {
    method: 'POST'
  });

  if (!resp.ok){
    console.log(await resp.text());
    return;
  }

  return await resp.json() as GoogleRefreshTokenResponse;
};

const revokeToken = async (token: string) => {
  const url = `https://oauth2.googleapis.com/revoke?token=${token}`;
  const resp = await fetch(url, {
    method: 'POST'
  });

  if (resp.ok)
    return true;

  try {
    const err = await resp.json();
    logger.info(err, 'Failed google revoke api');
  } catch {
    logger.info('Failed google revoke api');
  }
  return false;
};

export const googleApi = {
  authenticateCode,
  refreshToken,
  revokeToken,
  getYoutubeChannel
};
