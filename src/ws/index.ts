import WebSocket from 'isomorphic-ws'
import { CreateHiveWSParams, WSDataHandler } from '../types/index.js'

const createHiveWS = ({ type, ghostAddress, rootDomain, token }: CreateHiveWSParams) => {
  let ws = {} as WebSocket
  let initDuplex = false

  const open = (dataHandler?: WSDataHandler) => {
    const connectionURL = `wss://websocket.${rootDomain}/${ghostAddress}/${type}`
    ws = new WebSocket(connectionURL)

    ws.onopen = () => {
      console.log(`[${type}:${ghostAddress}] Connection established`)
      console.log(`[${type}:${ghostAddress}] Sending token to server`)

      ws.send(
        JSON.stringify({
          token,
        }),
      )
    }

    if (type === 'channel' && dataHandler) {
      ws.onmessage = ({ data }) => {
        dataHandler(data)
      }
    }

    ws.onclose = e => {
      if (e.wasClean) {
        console.log(`[${type}:${ghostAddress}] Connection closed cleanly, code=${e.code} reason=${e.reason}`)
      }

      console.log(`[${type}:${ghostAddress}] Connection died`)
    }

    ws.onerror = e => {
      console.log(`[${type}:${ghostAddress}] ${e.error}`)
    }
  }

  const close = () => ws.close()

  const sendData = (data: object) => {
    const dataString = JSON.stringify(data)
    switch (type) {
      case 'string':
        ws.send(dataString)
        break
      case 'channel':
        if (!initDuplex) {
          ws.send(
            JSON.stringify({
              url: ghostAddress,
            }),
          )
          initDuplex = true
        }

        ws.send(dataString)
        break
      default:
        break
    }
  }

  return {
    open,
    close,
    sendData,
  }
}

export default createHiveWS
