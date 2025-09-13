import { google } from 'googleapis'

// Service Account ile Google Drive API
export async function getServiceAccountAuth() {
  try {
    // Service Account JSON'u environment variable'dan al
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is missing')
    }
    
    const serviceAccount = JSON.parse(serviceAccountKey)
    
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/drive']
    })
    
    return auth
  } catch (error) {
    console.error('Service Account Auth Error:', error)
    throw error
  }
}

// Service Account ile access token al
export async function getServiceAccountAccessToken() {
  try {
    const auth = await getServiceAccountAuth()
    const authClient = await auth.getClient()
    const accessToken = await authClient.getAccessToken()
    
    if (!accessToken.token) {
      throw new Error('Failed to get access token from service account')
    }
    
    return accessToken.token
  } catch (error) {
    console.error('Service Account Access Token Error:', error)
    throw error
  }
}
