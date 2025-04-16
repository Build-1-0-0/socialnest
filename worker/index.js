import * as oauth from 'oauth4webapi';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Twitter OAuth endpoints (manual discovery)
    const as = {
      issuer: 'https://twitter.com',
      authorization_endpoint: 'https://twitter.com/i/oauth2/authorize',
      token_endpoint: 'https://api.twitter.com/2/oauth2/token',
    };

    const client = {
      client_id: env.TWITTER_CLIENT_ID,
    };

    const client_secret = env.TWITTER_CLIENT_SECRET;
    const redirect_uri = env.TWITTER_CALLBACK_URL;
    const clientAuth = oauth.ClientSecretPost(client_secret);

    const code_challenge_method = 'S256';

    // === /login route ===
    if (url.pathname === '/login') {
      const code_verifier = oauth.generateRandomCodeVerifier();
      const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier);
      const state = oauth.generateRandomState();

      // Save code_verifier to KV using state as key
      await env.SESSIONS.put(`state:${state}`, JSON.stringify({ code_verifier }), {
        expirationTtl: 300, // 5 minutes
      });

      const authUrl = new URL(as.authorization_endpoint);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', client.client_id);
      authUrl.searchParams.set('redirect_uri', redirect_uri);
      authUrl.searchParams.set('scope', 'tweet.read users.read offline.access');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', code_challenge);
      authUrl.searchParams.set('code_challenge_method', code_challenge_method);

      return Response.redirect(authUrl.toString(), 302);
    }

    // === /callback route ===
    if (url.pathname === '/callback') {
      const state = url.searchParams.get('state');
      const code = url.searchParams.get('code');

      if (!state || !code) {
        return new Response('Missing state or code.', { status: 400 });
      }

      // Retrieve code_verifier from KV
      const stored = await env.SESSIONS.get(`state:${state}`, { type: 'json' });
      if (!stored || !stored.code_verifier) {
        return new Response('Invalid or expired session state.', { status: 400 });
      }

      const code_verifier = stored.code_verifier;

      // Validate the auth response
      const validation = oauth.validateAuthResponse(as, client, url, state);
      if (oauth.isOAuth2Error(validation)) {
        return new Response(`OAuth error: ${validation.error}`, { status: 400 });
      }

      // Request access token
      const tokenResponse = await oauth.authorizationCodeGrantRequest(
        as,
        client,
        clientAuth,
        validation,
        redirect_uri,
        code_verifier
      );

      const result = await oauth.processAuthorizationCodeResponse(as, client, tokenResponse);
      if (oauth.isOAuth2Error(result)) {
        return new Response(`OAuth error: ${result.error}`, { status: 400 });
      }

      const { access_token, refresh_token, expires_in, token_type } = result;

      // Cleanup
      await env.SESSIONS.delete(`state:${state}`);

      return new Response(
        JSON.stringify({
          message: 'Login successful!',
          access_token,
          refresh_token,
          expires_in,
          token_type,
        }, null, 2),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Default response
    return new Response('Not Found', { status: 404 });
  }
};