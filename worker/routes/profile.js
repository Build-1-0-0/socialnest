export default async function profile(request, env) {
  try {
    const url = new URL(request.url);
    const state = url.searchParams.get('state');

    if (!state) {
      return new Response('Missing state/session.', { status: 400 });
    }

    // Look up session in KV (or other storage)
    const session = await env.SESSIONS.get(`state:${state}`);
    if (!session) {
      return new Response('Session expired or not found.', { status: 403 });
    }

    const sessionData = JSON.parse(session);
    const userId = sessionData.user_id;

    if (!userId) {
      return new Response('No user ID found in session.', { status: 403 });
    }

    // Fetch user profile from D1 DB
    const { results } = await env.DB.prepare(
      `SELECT twitter_id, username, name, profile_image_url FROM users WHERE twitter_id = ?`
    ).bind(userId).all();

    if (!results || results.length === 0) {
      return new Response('User not found.', { status: 404 });
    }

    const user = results[0];

    // Build HTML response (or return JSON)
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Profile</title></head>
      <body>
        <h1>Welcome, ${user.name}</h1>
        <p><strong>Username:</strong> ${user.username}</p>
        <img src="${user.profile_image_url}" alt="Profile Picture" style="border-radius:50%;width:100px;height:100px;">
        <p><a href="/">Go Home</a></p>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (err) {
    return new Response(`Error loading profile: ${err.message}`, {
      status: 500,
    });
  }
}
