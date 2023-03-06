import createHiveWS from './index.js'

const test = createHiveWS({
  type: 'string',
  token: 'yours_token',
  rootDomain: 'example.com',
  ghostAddress: 'domain/service/ghostID',
})

test.open(data => console.log(data))

setInterval(() => {
  test.sendData({
    txt: 'hello',
  })
}, 2000)
