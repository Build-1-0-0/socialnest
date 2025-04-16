import { generateTwitterAuthUrl } from '../utils/twitter';

export default async function login(request, env) {
  const url = await generateTwitterAuthUrl(env);
  return Response.redirect(url, 302);
}
