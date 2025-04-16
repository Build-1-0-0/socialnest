export async function getSession(kv, state) {
  const data = await kv.get(`state:${state}`, { type: 'json' });
  return data;
}
