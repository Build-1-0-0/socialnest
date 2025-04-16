import login from './routes/login';
import callback from './routes/callback';
import home from './routes/home';
import notFound from './routes/notFound';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/') return home(request, env, ctx);
    if (url.pathname === '/login') return login(request, env, ctx);
    if (url.pathname === '/callback') return callback(request, env, ctx);

    return notFound(request);
  },
};
