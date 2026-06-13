import { ExternalServiceType } from '../repository/types';

const googleUrl = (clientId: string, redirectUrl: string, scopes: string[]) =>
{
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  const query = {
    access_type: 'offline',
    include_granted_scopes: 'true',
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUrl,
    scope: scopes.join(' '),
    state: crypto.randomUUID()
  };
  const search = new URLSearchParams(query);
  url.search = search.toString();

  return url.toString();
};

const twitchUrl = (clientId: string, redirectUrl: string, scopes: string[]) =>
{
  const url = new URL('https://id.twitch.tv/oauth2/authorize');
  const query = {
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUrl,
    scopes: scopes.join(' '),
    state: crypto.randomUUID()
  };
  const search = new URLSearchParams(query);
  url.search = search.toString();

  return url.toString();
};

const tiktokUrl = (clientId: string, redirectUrl: string, scopes: string[]) =>
{
  const url = new URL('https://www.tiktok.com/v2/auth/authorize');
  const query = {
    response_type: 'code',
    client_key: clientId,
    redirect_uri: redirectUrl,
    scopes: scopes.join(' '),
    state: crypto.randomUUID()
  };

  const search = new URLSearchParams(query);
  url.search = search.toString();

  return url.toString();
};

const generateUrl = (clientId: string, redirectUrl: string, scopes: string[], type: ExternalServiceType) =>
{
  switch (type)
  {
  case ExternalServiceType.twitch:
    return twitchUrl(clientId, redirectUrl, scopes);
  case ExternalServiceType.tiktok:
    return tiktokUrl(clientId, redirectUrl, scopes);
  case ExternalServiceType.youtube:
    return googleUrl(clientId, redirectUrl, scopes);
  }
};

export const urlGenerator =
{
  googleUrl,
  tiktokUrl,
  twitchUrl,
  generateUrl
};
