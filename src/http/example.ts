import createHiveHTTP from './index.js'
import { HiveMessage } from '../types/index.js'

const http = createHiveHTTP({
  token: 'yours_token',
  rootDomain: 'example.com',
  ghostAddress: 'domain/service/ghostID',
})

const dataHandler = (data: HiveMessage) => {
  console.log(data)
}

const commandHandler = (command: HiveMessage) => {
  console.log(command)
}

http
  .channelInit({
    dataHandler,
    commandHandler,
    restartOnClose: true,
  })
  .listen()

http.sendData({
  txt: 'hello',
})

http.sendCommand({
  targetServiceAddress: 'test/asx/2',
  command: {
    txt: 'hello',
  },
})

setInterval(() => {
  http.sendData({
    txt: 'hello',
  })
}, 2000)
