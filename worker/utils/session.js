export async function saveSession(kv, state, data) {
  await kv.put(`state:${state}`, JSON.stringify(data), {
    expirationTtl: 300, // 5 minutes (adjust as needed)
  });
}

export async function getSession(kv, state) {
  const data = await kv.get(`state:${state}`, { type: 'json' });
  return data;
}