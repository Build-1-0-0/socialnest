export default function notFound(request) {
  return new Response('Not found', { status: 404 });
}
