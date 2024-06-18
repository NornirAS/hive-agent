import HiveAgent from '../agent/index.js'

const hiveAgent3 = new HiveAgent({ rootDomain: 'nornirhive.com' })

hiveAgent3
  .auth({
    username: '',
    password: '',
    clientId: '',
    clientSecrect: '',
  })
  .then(() => {
    hiveAgent3.initWs({
      type: 'duplex',
      domain: '',
      service: '',
      instance: '',
      dataHandler: (data: string) => {
        const { RTW } = JSON.parse(data)
        if (Array.isArray(RTW)) return console.log(RTW[0])
        return console.log(RTW)
      },
    })

    setInterval(async () => {
      hiveAgent3.wsSend({
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
