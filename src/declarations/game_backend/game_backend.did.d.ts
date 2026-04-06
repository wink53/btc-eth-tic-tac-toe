import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'getBoard' : ActorMethod<[], Array<bigint>>,
  'getCurrentPlayer' : ActorMethod<[], bigint>,
  'getWinner' : ActorMethod<[], bigint>,
  'getWinningPattern' : ActorMethod<[], Array<bigint>>,
  'isGameOver' : ActorMethod<[], boolean>,
  'makeMove' : ActorMethod<[bigint], { 'ok' : boolean } | { 'err' : string }>,
  'reset' : ActorMethod<[], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
