import { dejs, Denops } from "./deps.ts";

export const Message = {
  NotConnected: "not connected",
} as const;

async function render(
  content: string,
  params?: dejs.Params,
): Promise<string> {
  return (params == null) ? content : dejs.renderToString(content, params);
}

// export async function echom(denops: Denops, content: string, param?: dejs.Params) {
//   const s = await render(content, param);
//
//   console.log(s);
// }

export async function info() {
}
