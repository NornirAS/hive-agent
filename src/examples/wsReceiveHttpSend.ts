import HiveAgent from '../agent/index.js'

const hiveAgent = new HiveAgent({ rootDomain: 'nornirhive.com' })

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
      domain: 'appollo',
      service: 'orra',
      instance: '1',
      dataHandler: (data: string) => {
        const { RTW } = JSON.parse(data)
        if (Array.isArray(RTW)) return console.log(RTW[0])
        return console.log(RTW)
      },
    })

    setInterval(async () => {
      hiveAgent.httpSend({
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
    }, 5000)
  })
