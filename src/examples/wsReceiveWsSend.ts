import HiveAgent from '../agent/index.js'

const hiveAgent = new HiveAgent({ rootDomain: 'nornirhive.com' })
const hiveAgent2 = new HiveAgent({ rootDomain: 'nornirhive.com' })

hiveAgent
  .auth({
    username: '',
    password: '',
    clientId: '',
    clientSecrect: '',
  })
  .then(() => {
    hiveAgent.initWs({
      type: 'receiver',
      domain: '',
      service: '',
      instance: '',
      dataHandler: (data: string) => {
        const { RTW } = JSON.parse(data)
        if (Array.isArray(RTW)) return console.log(RTW[0])
        return console.log(RTW)
      },
    })
  })

hiveAgent2
  .auth({
    username: '',
    password: '',
    clientId: '',
    clientSecrect: '',
  })
  .then(() => {
    hiveAgent2.initWs({
      type: 'sender',
      domain: '',
      service: '',
      instance: '',
    })

    setInterval(async () => {
      hiveAgent2.wsSend({
        domain: '',
        service: '',
        instance: '',
        data: {
          SENDER: 'test',
          RECEIVER: 'test',
          TIMESTAMP: new Date().toISOString(),
          TOPIC: 'test',
          REFID: 'test',
          PAYLOAD: 'test',
        },
      })
    }, 2000)
  })
