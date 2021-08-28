import { nrepl } from "../deps.ts";

export function updateDoneResponse(
  done: nrepl.NreplDoneResponse,
  key: string,
  updateFn: (b: nrepl.bencode.Bencode) => nrepl.bencode.Bencode,
): nrepl.NreplDoneResponse {
  const bencodes: Array<nrepl.bencode.BencodeObject> = done.responses.map(
    (r) => {
      const bencode = r.response;
      if (
        !nrepl.bencode.isObject(bencode) ||
        bencode[key] == null
      ) {
        return bencode;
      }

      bencode[key] = updateFn(bencode[key]);
      return bencode;
    },
  );

  return nrepl.util.doneResponse(bencodes, done.context);
}
