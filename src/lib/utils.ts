export async function jsonRes<T>(data: T, init?: number | ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
    ...(typeof init === 'number' ? { status: init } : init)
  })
}