import {API_CALLBACK_URI} from './constants';

/**
 * Generate the authentication URL for obtaining an auth code.
 */
export const getAuthUrl = (authUrl: string, clientId: string, backendUrl: string, codeChallenge: string, state: string): string => {
  const url = new URL(`${authUrl}`);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid');
  url.searchParams.set('redirect_uri', `${backendUrl}${API_CALLBACK_URI}`);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', state);
  return url.toString();
};
