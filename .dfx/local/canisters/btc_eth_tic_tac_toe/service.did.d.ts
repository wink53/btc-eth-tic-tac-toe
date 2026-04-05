import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<{ 'value' : string, 'name' : string }>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<{ 'value' : string, 'name' : string }>,
  'streaming_strategy' : [] | [string],
  'status_code' : bigint,
}
export interface _SERVICE {
  'getBoard' : ActorMethod<[], Array<bigint>>,
  'getCurrentPlayer' : ActorMethod<[], bigint>,
  'getWinner' : ActorMethod<[], bigint>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'isGameOver' : ActorMethod<[], boolean>,
  'makeMove' : ActorMethod<[bigint], { 'ok' : boolean } | { 'err' : string }>,
  'reset' : ActorMethod<[], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
