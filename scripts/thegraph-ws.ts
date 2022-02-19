import { createClient, MessageType } from 'graphql-ws'
import WebSocket from 'ws'

Object.assign(global, { WebSocket: WebSocket })

let generateReport = async () => {
  const client = createClient({
    url: 'ws://127.0.0.1:8001/subgraphs/name/fatter-bo/gameswap-subgraph',
    //url: 'wss://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
    webSocketImpl: WebSocket,
    lazy: true,
    keepAlive: 5,
  })
  client.on('error', (err) => {
    console.log('client.error:', err)
  })
  client.on('closed', (err) => {
    console.log('closed:', err)
  })
  client.on('connecting', () => {
    console.log('connecting.on:')
  })
  // client.on('connected', (msg) => {
  //   console.log('connected.on:', msg)
  // })
  client.on('message', (msg) => {
    console.log('message.on:', msg)
    switch (msg.type) {
      case MessageType.ConnectionAck:
        console.log('xxxxxx:', msg)
        //WebSocket. reconnecting
        //msg.payload
        break

      default:
        break
    }
  })
  // query
  const result0 = await new Promise((resolve, reject) => {
    let result: any

    client.subscribe(
      {
        query: 'gameInfos(subgraphError:allow){ id title }',
      },
      {
        next: (data: any) => (result = data),
        error: reject,
        complete: () => resolve(result),
      }
    )
  })
    .then((err) => console.log('then:', err))
    .catch((err) => console.log('catch:', err))

  console.log('query0:', result0)

  // subscription
  let result: any
  const onNext = (result: any) => {
    result = result
    console.log('query1:', result)
    /* handle incoming values */
  }

  let unsubscribe = () => {
    /* complete the subscription */
  }

  await new Promise((resolve, reject) => {
    unsubscribe = client.subscribe(
      {
        query: 'gameInfos(subgraphError:allow){ id title }',
      },
      {
        next: onNext,
        error: reject,
        complete: () => resolve(result),
      }
    )
  })
    .then((err) => console.log('then:', err))
    .catch((err) => console.log('catch:', err))
    .finally(() => console.log('final'))
}
generateReport()
