import { nrepl } from "../../deps.ts";
import { Bencode, BencodeObject, NreplDoneResponse } from "../../types.ts";

export function updateDoneResponse(
  done: NreplDoneResponse,
  key: string,
  updateFn: (b: Bencode) => Bencode,
): NreplDoneResponse {
  const bencodes: Array<BencodeObject> = done.responses.map(
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
