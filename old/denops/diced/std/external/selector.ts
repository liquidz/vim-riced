import { Diced } from "../../types.ts";
import { dpsAnon, unknownutil } from "../../deps.ts";

interface SelectorResponse {
  // e : expect to handle in current buffer
  // t : expect to handle in new tab
  // v : expect to handle in splitted window
  mode: string;
  text: string;
}

export function start(
  diced: Diced,
  candidates: Array<string>,
): Promise<SelectorResponse> {
  const denops = diced.denops;
  return new Promise<SelectorResponse>((resolve, reject) => {
    const id = dpsAnon.once(denops, (mode, text) => {
      if (unknownutil.isString(mode) && unknownutil.isString(text)) {
        resolve({ mode: mode, text: text });
      } else {
        reject(new Deno.errors.InvalidData());
      }
    })[0];

    denops.call("fzf#diced#start", {
      plugin_name: denops.name,
      callback_id: id,
      candidates: candidates,
    });
  });
}
