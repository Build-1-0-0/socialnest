import * as oauth from 'oauth4webapi';
import { getSession } from '../utils/session';

export default async function callback(request, env) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');

  if (!state || !code) {
    return new Response('Missing state or code.', { status: 400 });
  }

  const stored = await getSession(env.SESSIONS, state);
  if (!stored || !stored.codeVerifier) {
    return new Response('Invalid or expired session state.', { status: 400 });
  }

  const code_verifier = stored.codeVerifier;

  const as = {
    authorization_endpoint: 'https://twitter.com/i/oauth2/authorize',
    token_endpoint: 'https://api.twitter.com/2/oauth2/token',
  };

  const client = {
    client_id: env.TWITTER_CLIENT_ID,
  };
  const client_secret = env.TWITTER_CLIENT_SECRET;
  const redirect_uri = env.TWITTER_CALLBACK_URL;
  const clientAuth = oauth.ClientSecretPost(client_secret);

  const params = url;
  const validation = oauth.validateAuthResponse(as, client, params, state);
  if (validation.error) {
    return new Response(`OAuth error: ${validation.error}`, { status: 400 });
  }

  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    clientAuth,
    validation,
    redirect_uri,
    code_verifier
  );

  const result = await oauth.processAuthorizationCodeResponse(as, client, response);
  if (result.error) {
    return new Response(`OAuth error: ${result.error}`, { status: 400 });
  }

  const access_token = result.access_token;

  // Delete the session from KV
  await env.SESSIONS.delete(`state:${state}`);

  return new Response(`Login successful! Access Token: ${access_token}`);
}