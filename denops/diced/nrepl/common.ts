import { nrepl } from "../deps.ts";
import { Diced } from "../types.ts";
import { execute } from "../interceptor/core.ts";

export async function request(
  diced: Diced,
  message: nrepl.NreplRequest,
  context?: nrepl.Context,
): Promise<nrepl.NreplDoneResponse> {
  if (!diced.connectionManager.isConnected) {
    return Promise.reject("FIXME not connected");
  }
  const conn = diced.connectionManager.currentConnection;

  if (message["session"] == null) {
    message["session"] = conn.session;
  }

  // execute(diced, message['op'], {message: message, context: context}, async (ctx) => {
  //     ctx['response'] =
  //
  // })

  return conn.client.write(message, context || {});
}
