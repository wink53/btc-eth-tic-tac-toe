export const idlFactory = ({ IDL }) => {
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text })),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text })),
    'streaming_strategy' : IDL.Opt(IDL.Text),
    'status_code' : IDL.Nat,
  });
  return IDL.Service({
    'getBoard' : IDL.Func([], [IDL.Vec(IDL.Nat)], ['query']),
    'getCurrentPlayer' : IDL.Func([], [IDL.Nat], ['query']),
    'getWinner' : IDL.Func([], [IDL.Nat], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'isGameOver' : IDL.Func([], [IDL.Bool], ['query']),
    'makeMove' : IDL.Func(
        [IDL.Nat],
        [IDL.Variant({ 'ok' : IDL.Bool, 'err' : IDL.Text })],
        [],
      ),
    'reset' : IDL.Func([], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
