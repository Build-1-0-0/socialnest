import login from './routes/login';
import callback from './routes/callback';
import home from './routes/home';
import profile from './routes/profile'; // <-- add this line
import notFound from './routes/notFound';

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      switch (pathname) {
        case '/':
        case '/home':
          return home(request, env, ctx);

        case '/login':
          return login(request, env, ctx);

        case '/callback':
          return callback(request, env, ctx);

        case '/profile': // <-- handle /profile route
          return profile(request, env, ctx);

        default:
          return notFound(request);
      }
    } catch (err) {
      return new Response(`Internal Server Error: ${err.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },
};