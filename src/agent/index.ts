import WebSocket from 'isomorphic-ws'

interface HiveAgentOptions {
  rootDomain: string
}

interface AuthConfig {
  clientId: string
  clientSecrect: string | undefined
  username: string | undefined
  password: string | undefined
}

type WSType = 'sender' | 'receiver' | 'duplex'

interface WSInitParams {
  type: WSType
  domain: string
  service: string
  instance: string
  dataHandler?: (data: string) => void
}

interface DataSchema {
  SENDER: string
  RECEIVER: string
  TIMESTAMP: string
  TOPIC: string
  REFID: string
  PAYLOAD: string
}

interface SendMessage {
  domain: string
  service: string
  instance: string
  data: DataSchema
}

export default class HiveAgent {
  authServer: string

  authError: boolean

  authRefreshToken: string | undefined

  authAccessToken: string | undefined

  authAccessTokenExpiresIn: number | undefined

  authRefreshTokenExpiresIn: number | undefined

  rootDomain: string

  username: string | undefined

  ws: WebSocket | undefined

  constructor({ rootDomain }: HiveAgentOptions) {
    this.authServer = `https://kc.${rootDomain}/auth/realms/Synx-Realm/protocol/openid-connect/token`
    this.authError = false
    this.authRefreshToken = undefined
    this.authAccessToken = undefined
    this.authAccessTokenExpiresIn = undefined
    this.authRefreshTokenExpiresIn = undefined
    this.rootDomain = rootDomain
    this.username = undefined
    this.ws = undefined
  }

  async auth({ username, password, clientId, clientSecrect }: AuthConfig) {
    const reqBody = this.authRefreshToken
      ? `grant_type=refresh_token&refresh_token=${this.authRefreshToken}`
      : `grant_type=password&username=${username}&password=${password}`

    const getRefreshTokenInterval = () => {
      const defaultIntervalMS = 300 * 1000
      const expirationMS = this.authAccessTokenExpiresIn ? this.authAccessTokenExpiresIn * 1000 : defaultIntervalMS
      // MS to substract to refresh token befor expiration
      const expirationDiscount = 10 * 1000
      return expirationMS - expirationDiscount
    }

    const authRequest = async () => {
      const res = await fetch(this.authServer, {
        body: `client_id=${clientId}&client_secret=${clientSecrect}&${reqBody}`,
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

      this.authAccessToken = accessToken
      this.authRefreshToken = refreshToken
      this.authAccessTokenExpiresIn = accessTokenExpiresIn
      this.authRefreshTokenExpiresIn = refreshTokenExpiresIn
      this.authError = false
    }

    try {
      await authRequest()
      const interval = setInterval(async () => {
        clearInterval(interval)
        await authRequest()
      }, getRefreshTokenInterval())

      this.username = username
    } catch (e) {
      this.authError = true
      console.error('Auth error', e)
    }
  }

  async httpSend({ domain, service, instance, data }: SendMessage) {
    try {
      if (!this.authAccessToken) throw new Error('Unauthorized')

      await fetch(`https://${domain}.${this.rootDomain}/${service}/${instance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.authAccessToken}`,
          'Synx-Cat': '1',
        },
        body: JSON.stringify(data),
      })
    } catch (e) {
      console.error('Send message error', e)
    }
  }

  wsSend({ domain, service, instance, data }: SendMessage) {
    this.ws?.send(
      JSON.stringify({
        serviceName: service,
        ghostId: instance,
        domainName: domain,
        payload: data,
      }),
    )
  }

  initWs({ type, domain, service, instance, dataHandler }: WSInitParams) {
    if (!this.authAccessToken) throw new Error('Unauthorized')
    if (this.ws) throw new Error('WebSocket is in use')

    const connectionURLSuffixByType = {
      sender: 'ws-s',
      receiver: 'ws-c',
      duplex: `${service}/${instance}/${this.username}`,
    }

    const connectionURL = `wss://${domain}.${this.rootDomain}/${connectionURLSuffixByType[type]}`

    this.ws = new WebSocket(connectionURL, {
      headers: {
        Authorization: `Bearer ${this.authAccessToken}`,
      },
    })

    this.ws.onopen = () => {
      console.log(`[${type}:${domain}/${service}/${instance}] Connection established`)
      console.log(`[${type}:${domain}/${service}/${instance}] Initial message to server`)

      if (type === 'receiver') {
        this.ws?.send(
          JSON.stringify({
            userName: this.username,
            serviceName: service,
            domain,
            instance,
          }),
        )
      }
    }

    this.ws.onmessage = ({ data }) => {
      dataHandler!(data as string)
    }

    this.ws.onclose = e => {
      if (e.wasClean) {
        console.log(
          `[${type}:${domain}/${service}/${instance}] Connection closed cleanly, code=${e.code} reason=${e.reason}`,
        )
      }
      console.log(`[${type}:${domain}/${service}/${instance}] Connection died`)
    }

    this.ws.onerror = e => {
      console.log(`[${type}:${domain}/${service}/${instance}] ${e.error}`)
    }
  }
}
