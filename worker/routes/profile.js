export default async function profile(request, env) {
  try {
    const url = new URL(request.url);
    const state = url.searchParams.get('state');

    if (!state) {
      return new Response('Missing state/session.', { status: 400 });
    }

    // Retrieve session from KV storage
    const session = await env.SESSIONS.get(`state:${state}`);
    if (!session) {
      return new Response('Session expired or not found.', { status: 403 });
    }

    const sessionData = JSON.parse(session);
    const userId = sessionData.user_id;

    if (!userId) {
      return new Response('No user ID found in session.', { status: 403 });
    }

    // Fetch profile from D1 database
    const { results } = await env.DB.prepare(
      `SELECT twitter_id, username, name, profile_image_url FROM users WHERE twitter_id = ?`
    ).bind(userId).all();

    if (!results || results.length === 0) {
      return new Response('User not found.', { status: 404 });
    }

    const user = results[0];

    // Basic sanitization (optional: use libraries for full protection)
    const escapeHTML = (str) =>
      str.replace(/[&<>'"]/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])
      );

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${escapeHTML(user.name)}'s Profile</title>
        <style>
          body { font-family: sans-serif; text-align: center; margin-top: 50px; }
          img { border-radius: 50%; width: 120px; height: 120px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Welcome, ${escapeHTML(user.name)}</h1>
        <p><strong>Username:</strong> ${escapeHTML(user.username)}</p>
        <img src="${user.profile_image_url}" alt="Profile Picture">
        <p><a href="/api/twitter/home">Go Home</a></p>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (err) {
    return new Response(`Error loading profile: ${err.message}`, {
      status: 500,
    });
  }
}