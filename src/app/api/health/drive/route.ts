import { getAccessToken } from '@/lib/google'

export async function GET() {
  try {
    await getAccessToken()
    return new Response(
      JSON.stringify({ ok: true }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      }
    )
  } catch (e: any) {
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: e.message || 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json'
        }
      }
    )
  }
}
