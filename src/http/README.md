# Hive HTTP

Create a connection to exchange data between ghosts and commands between services.

## Import

```javascript
import hiveHTTP from '@norniras/hive-agent/http'
```

## How to use

Create an instance of HiveHTTP.

```javascript
const hiveHTTP = createHiveHTTP({
  token: 'yours_token',
  rootDomain: 'example.com',
  ghostAddress: 'domain/service/ghostID',
})
```

### HTTP Send Data

This method will send data to the Hive.

```javascript
hiveHTTP.sendData(data) // data is an object - keys should meet service data structure
```

### HTTP Send Command

This method will send command to the Hive.

When you want to send the command, you need to specify targetServiceAddress, where command should be sent.

```javascript
hiveHTTP.sendCommmand(command) // command is an object - keys should meet service command structure
```

### HTTP Listen Channel

This method will open a long pooling channel and we will receive data.

User should put all the logic inside the dataHandler or commandHandler.

```javascript
const dataHandler = data => {
  // do something with the data
  console.log(data)
}

const commandHandler = command => {
  // do something with the command
  console.log(data)
}
hiveHTTP
  .channelInit({
    dataHandler, // callback to handle data
    commandHandler, // callback to handle commands
    restartOnClose, // is service should be restarted on connection close
  })
  .listen()
```
