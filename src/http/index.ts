import fetch from 'cross-fetch'
import type {
  CreateHiveHTTPParams,
  HiveMessage,
  SendCommandParams,
  ServiceURLParams,
  ChannelInitConfig,
} from '../types/index.js'

const createHiveHTTP = ({ token, rootDomain, ghostAddress }: CreateHiveHTTPParams) => {
  const baseHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  const parseNetworkResourceAddress = (resourceAddress: string): string[] => resourceAddress.split('/')

  const serviceURL = ({ domain, service }: ServiceURLParams) => `https://${domain}.${rootDomain}/${service}`

  const objectToQueryString = (obj: HiveMessage): string =>
    Object.entries(obj)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

  const sendData = async (data: HiveMessage) => {
    const [domain, service, ghostID] = parseNetworkResourceAddress(ghostAddress)
    try {
      await fetch(serviceURL({ domain, service }), {
        method: 'POST',
        headers: {
          ...baseHeaders,
          ...{ 'Synx-Cat': '1' },
        },
        body: objectToQueryString({ token, objectID: ghostID, ...data }),
      })
      return [null]
    } catch (error) {
      return [error]
    }
  }

  const sendCommand = async ({ targetServiceAddress, command }: SendCommandParams) => {
    const [domain, service] = parseNetworkResourceAddress(ghostAddress)
    const [targetDomain, targetService] = parseNetworkResourceAddress(targetServiceAddress)
    try {
      await fetch(serviceURL({ domain: targetDomain, service: targetService }), {
        method: 'POST',
        headers: {
          ...baseHeaders,
          ...{ 'Synx-Cat': '0' },
        },
        body: objectToQueryString({
          token,
          refDomain: domain,
          refService: service,
          ...command,
        }),
      })
      return [null]
    } catch (error) {
      return [error]
    }
  }

  const channelInit = (config: ChannelInitConfig) => {
    const channelConfig = {} as ChannelInitConfig

    Object.assign(channelConfig, config)

    const getReadableStream = async () => {
      let readableStream: unknown

      try {
        const [domain, service, ghostID] = parseNetworkResourceAddress(ghostAddress)
        const { body } = await fetch(serviceURL({ domain, service }), {
          method: 'POST',
          headers: {
            ...baseHeaders,
            ...{ 'Synx-Cat': '4' },
          },
          body: objectToQueryString({
            token,
            objectID: ghostID,
            format: 'json',
          }),
        })
        readableStream = body
      } catch (error) {
        readableStream = null
      }

      return readableStream
    }

    const handleReadableStreamBrowser = (reader: ReadableStreamDefaultReader, listen: Function) => {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            if (!channelConfig.restartOnClose) return console.log(`[${ghostAddress}] Channel closed`)
            console.log(`[${ghostAddress}] Channel closed`)
            listen()
            return console.log(`[${ghostAddress}] Channel restarted`)
          }

          const data = new TextDecoder().decode(value)

          if (!data || typeof data !== 'string')
            return console.log(`[${ghostAddress}] Received unsupported data format`)

          try {
            const { RTW, CMD } = JSON.parse(data.trim())
            if (RTW) channelConfig.dataHandler(RTW)
            if (CMD && channelConfig.commandHandler) channelConfig.commandHandler(CMD)
          } catch (e) {
            console.log(`[${ghostAddress}] Received data is not a JSON`)
          }

          return true
        })
        .finally(() => handleReadableStreamBrowser(reader, listen))
    }

    const handleReadableStreamNode = (stream: NodeJS.ReadableStream, listen: Function) => {
      stream.on('readable', () => {
        const data = stream.setEncoding('utf8').read()

        if (!data || typeof data !== 'string') return console.log(`[${ghostAddress}] Received unsupported data format`)

        try {
          const { RTW, CMD } = JSON.parse(data.trim())
          if (RTW) channelConfig.dataHandler(RTW)
          if (CMD && channelConfig.commandHandler) channelConfig.commandHandler(CMD)
        } catch (e) {
          console.log(`[${ghostAddress}] Received data is not a JSON`)
        }

        return true
      })

      stream.on('close', () => {
        if (!channelConfig.restartOnClose) return console.log(`[${ghostAddress}] Channel closed`)
        console.log(`[${ghostAddress}] Channel closed`)
        listen()
        return console.log(`[${ghostAddress}] Channel restarted`)
      })
    }

    const listen = async () => {
      console.log(`[${ghostAddress}] Waiting for messages`)
      const readableStream = await getReadableStream()

      if (!readableStream) return console.log(`[${ghostAddress}] Cannot get readable stream`)
      // Browser stream reader
      if (typeof window === 'object' && readableStream instanceof ReadableStream) {
        const reader = readableStream.getReader()
        handleReadableStreamBrowser(reader, listen)
      } else {
        handleReadableStreamNode(readableStream as NodeJS.ReadableStream, listen)
      }

      return true
    }
    return {
      listen,
    }
  }

  return {
    sendData,
    sendCommand,
    channelInit,
  }
}

export default createHiveHTTP
