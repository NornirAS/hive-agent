import { Data } from 'isomorphic-ws'

export type ConnectionType = 'string' | 'channel'

export type GhostAddress = string

export type WSDataHandler = (data: Data) => void

export type HTTPDataHandler = (data: HiveMessage) => void

export type HTTPCommandHandler = (command: HiveMessage) => void

export interface CreateHiveHTTPParams {
  token: string
  rootDomain: string
  ghostAddress: string
}

export interface CreateHiveWSParams {
  type: ConnectionType
  ghostAddress: GhostAddress
  rootDomain: string
  token: string
}

export interface ChannelInitConfig {
  dataHandler: HTTPDataHandler
  commandHandler?: HTTPCommandHandler
  restartOnClose?: boolean
}

export interface ServiceURLParams {
  domain: string
  service: string
}

export interface HiveMessage {
  [key: string]: string | number | boolean
}

export interface SendCommandParams {
  targetServiceAddress: string
  command: HiveMessage
}
