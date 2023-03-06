# Hive WebSocket

Create a connection to exchange data between Ghosts.

### Note

- WebSockets don't receive commands therefore use an HTTP client if you need to proceed with commands.

## Import

```javascript
import hiveWS from '@norniras/hive-agent/ws'
```

## How to use

Create an instance of HiveWS

```javascript
const hiveWS = createHiveWS({
  type: 'string',
  token: 'yours_token',
  rootDomain: 'example.com',
  ghostAddress: 'domain/service/ghostID',
})
```

### WebSocket Open

This method will open a ws connection.

#### Channel Example

When channel connection is opened you can receive messages from ghostAddress.

```javascript
const dataHandler = data => {
  // do something with the data
  console.log(data)
}
hiveWS.open(dataHandler)
```

#### String Example

When string connection is opened you can send messages to ghostAddress.

```javascript
hiveWS.open()
```

### WebSocket SendData

This method will send data to the Hive.

```javascript
hiveWS.sendData(data) // data is an object - keys should meet service data structure
```

### WebSocket Close

This method will close a ws connection.

```javascript
hiveWS.close()
```
