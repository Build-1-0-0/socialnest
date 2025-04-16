import * as oauth from 'oauth4webapi';

export async function generateTwitterAuthUrl(env) {
  const client = {
    client_id: env.TWITTER_CLIENT_ID,
    redirect_uri: env.TWITTER_CALLBACK_URL,
  };

  const state = oauth.generateRandomState();
  const code_verifier = oauth.generateRandomCodeVerifier();
  const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier);

  // Save state & verifier to KV
  await env.SESSIONS.put(`state:${state}`, JSON.stringify({ codeVerifier: code_verifier }), {
    expirationTtl: 600, // 10 minutes
  });

  const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', client.client_id);
  authUrl.searchParams.set('redirect_uri', client.redirect_uri);
  authUrl.searchParams.set('scope', 'tweet.read users.read offline.access');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', code_challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  return authUrl.toString();
    }
