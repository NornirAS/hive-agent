import { AuthConfig } from '../types/index.js'

export default function useAuth({ username, password, clientId, clientSecrect }: AuthConfig) {
  let synxRefreshToken: string | undefined

  const getAccessToken = async () => {
    try {
      const res = await fetch('https://kc.nornirhive.com/auth/realms/Synx-Realm/protocol/openid-connect/token', {
        body: `grant_type=password&username=${username}&password=${password}&client_id=${clientId}&client_secret=${clientSecrect}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      })

      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: accessTokenExpiresIn,
        refresh_expires_in: refreshTokenExpiresIn,
      } = await res.json()

      synxRefreshToken = refreshToken

      return { accessToken, accessTokenExpiresIn, refreshTokenExpiresIn }
    } catch (e) {
      return console.error('Error while getting token', e)
    }
  }

  const refreshAccessToken = async () => {
    try {
      const res = await fetch('https://kc.nornirhive.com/auth/realms/Synx-Realm/protocol/openid-connect/token', {
        body: `grant_type=refresh_token&refresh_token=${synxRefreshToken}&client_id=${clientId}&client_secret=${clientSecrect}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      })

      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: accessTokenExpiresIn,
        refresh_expires_in: refreshTokenExpiresIn,
      } = await res.json()

      synxRefreshToken = refreshToken

      return { accessToken, accessTokenExpiresIn, refreshTokenExpiresIn }
    } catch (e) {
      return console.error('Error while refresh token', e)
    }
  }

  return {
    getAccessToken,
    refreshAccessToken,
  }
}
