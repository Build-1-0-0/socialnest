import * as oauth from 'oauth4webapi';
import { generateRandomString } from '../utils/helpers';
import { saveSession } from '../utils/session';

export default async function login(request, env) {
  const state = generateRandomString();
  const codeVerifier = generateRandomString();
  const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);

  const authorizationEndpoint = 'https://twitter.com/i/oauth2/authorize';
  const redirect_uri = env.TWITTER_CALLBACK_URL;

  const authUrl = new URL(authorizationEndpoint);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', env.TWITTER_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirect_uri);
  authUrl.searchParams.set('scope', 'tweet.read users.read offline.access');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  // Store session in KV
  await saveSession(env.SESSIONS, state, { codeVerifier });

  return Response.redirect(authUrl.toString(), 302);
}