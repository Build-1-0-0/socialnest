import { OAuth2Client } from 'oauth4webapi';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    console.log(`Request URL: ${url.pathname}`);

    if (url.pathname === '/login') {
      const client = new OAuth2Client({
        client_id: env.TWITTER_CLIENT_ID,
        client_secret: env.TWITTER_CLIENT_SECRET,
        token_endpoint: 'https://api.twitter.com/2/oauth2/token',
        redirect_uri: env.TWITTER_CALLBACK_URL,
      });

      const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', env.TWITTER_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', env.TWITTER_CALLBACK_URL);
      authUrl.searchParams.set('scope', 'tweet.read users.read');
      authUrl.searchParams.set('state', crypto.randomUUID());
      authUrl.searchParams.set('code_challenge', 'challenge'); // Add PKCE if needed
      authUrl.searchParams.set('code_challenge_method', 'plain');

      return Response.redirect(authUrl.toString(), 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const client = new OAuth2Client({
        client_id: env.TWITTER_CLIENT_ID,
        client_secret: env.TWITTER_CLIENT_SECRET,
        token_endpoint: 'https://api.twitter.com/2/oauth2/token',
        redirect_uri: env.TWITTER_CALLBACK_URL,
      });

      const result = await client.requestAccessToken(code);
      const token = result.access_token;

      console.log('Access token:', token);

      // Optional: Save user to DB (pseudo-code)
      // await env.DB.prepare(`INSERT INTO users (token) VALUES (?)`).bind(token).run();

      return new Response('Twitter login successful. Token stored.');
    }

    return new Response('Not Found', { status: 404 });
  },
};
