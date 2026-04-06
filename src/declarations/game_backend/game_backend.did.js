export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getBoard' : IDL.Func([], [IDL.Vec(IDL.Nat)], ['query']),
    'getCurrentPlayer' : IDL.Func([], [IDL.Nat], ['query']),
    'getWinner' : IDL.Func([], [IDL.Nat], ['query']),
    'getWinningPattern' : IDL.Func([], [IDL.Vec(IDL.Nat)], ['query']),
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
