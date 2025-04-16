export default function home(request, env, ctx) {
  return new Response('Welcome to SocialNest! Please use /login to authenticate with Twitter.');
}
