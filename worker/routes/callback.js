export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      return new Response('Missing code or state in callback.', { status: 400 });
    }

    // Retrieve the stored state value from KV (or your session store)
    const storedState = await env.SESSIONS.get(`state:${state}`);
    if (!storedState) {
      return new Response('Invalid or expired state.', { status: 403 });
    }

    const client_id = env.TWITTER_CLIENT_ID;
    const client_secret = env.TWITTER_CLIENT_SECRET;
    const redirect_uri = env.TWITTER_REDIRECT_URI;

    // Step 1: Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`),
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id,
        redirect_uri,
        code_verifier: storedState, // we stored PKCE code_verifier in state
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return new Response(`Failed to get access token: ${JSON.stringify(tokenData)}`, { status: 500 });
    }

    const access_token = tokenData.access_token;

    // Step 2: Fetch user information
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userData.data) {
      return new Response(`Failed to fetch user info: ${JSON.stringify(userData)}`, { status: 500 });
    }

    const { id: twitter_id, username, name } = userData.data;

    // Optional: Get profile image URL via Twitter v2 API (you can also enrich data)
    const profile_image_url = `https://unavatar.io/twitter/${username}`;

    // Step 3: Store or update user in D1
    await env.DB.prepare(
      `INSERT OR REPLACE INTO users (twitter_id, username, name, profile_image_url, access_token, refresh_token)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      twitter_id, username, name, profile_image_url,
      tokenData.access_token, tokenData.refresh_token || null
    ).run();

    // Step 4: Create a new session (could be stored in KV)
    const sessionData = {
      user_id: twitter_id,
      username,
      name,
      created: Date.now(),
    };

    const sessionKey = `session:${crypto.randomUUID()}`;
    await env.SESSIONS.put(sessionKey, JSON.stringify(sessionData), { expirationTtl: 60 * 60 * 24 });

    // Step 5: Redirect to profile with session
    const profileUrl = new URL('/profile', url.origin);
    profileUrl.searchParams.set('state', sessionKey); // Or use cookie instead

    return Response.redirect(profileUrl.toString(), 302);
  },
};