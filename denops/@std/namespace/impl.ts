import { App, z } from "../deps.ts";
import * as sexp from "../sexp/impl.ts";
import * as paredit from "../paredit/impl.ts";
import * as cache from "../cache/impl.ts";
import * as op from "../op/impl.ts";

const SearchResultSchema = z.tuple([z.number(), z.number()]);
type SearchResult = z.infer<typeof SearchResultSchema>;

async function searchNamespace(app: App): Promise<SearchResult | undefined> {
  const resp = await app.denops.batch(
    ["searchpos", `(ns[ \r\n]`, "bcnW"],
    ["searchpos", `(in-ns[ \r\n]`, "bcnW"],
  );

  const nsPos = SearchResultSchema.parse(resp[0]);
  const inNsPos = SearchResultSchema.parse(resp[1]);

  if (nsPos[0] === 0 && inNsPos[0] === 0) {
    return undefined;
  } else if (nsPos[0] !== 0 && inNsPos[0] === 0) {
    return nsPos;
  } else if (nsPos[0] === 0 && inNsPos[0] !== 0) {
    return inNsPos;
  } else if (nsPos[0] < inNsPos[0]) {
    return nsPos;
  } else {
    return inNsPos;
  }
}

/**
 * Return the code of the namespace form.
 */
export async function code(app: App): Promise<string | undefined> {
  const pos = await searchNamespace(app);
  if (pos == null) {
    return;
  }

  return await sexp.getTopList(app, pos[0], pos[1]);
}

/**
 * Return the namespace name detected from the current buffer.
 */
export async function nameByBuffer(app: App): Promise<string | undefined> {
  const nsCode = await code(app);
  if (nsCode == null) {
    return;
  }
  const name = paredit.node(
    paredit.skipMetas(paredit.right(paredit.down(paredit.parse(nsCode)))),
  );

  return (name === "") ? undefined : name.trim();
}

/**
 * Return the namespace name from the *ns* var.
 */
export async function nameByVar(app: App): Promise<string | undefined> {
  const resp = await op.nrepl.evaluate(app, {
    code: "(ns-name *ns*)",
    silent: true,
  });
  const name = resp.getOne("value");
  if (typeof name !== "string") {
    return;
  }
  return name;
}

/**
 * Return the namespace name detected from the current buffer or the *ns* var.
 */
export async function name(app: App): Promise<string | undefined> {
  const name = await nameByBuffer(app);
  if (name != null) {
    return name;
  }

  return await nameByVar(app);
}

export async function evaluateOnlyNsForm(app: App) {
  const nsCode = await code(app);
  if (nsCode == null) {
    return;
  }

  await op.nrepl.evaluate(app, { code: nsCode, silent: true });
}

/**
 * Load the current namespace.
 */
export async function loadCurrentNamespace(app: App) {
  const resp = await app.denops.batch(
    ["getline", 1, "$"],
    ["expand", "%"],
    ["expand", "%:p"],
  );

  const lines = z.array(z.string()).parse(resp[0]);
  const fileName = (typeof resp[1] === "string") ? resp[1] : "";
  const filePath = (typeof resp[2] === "string") ? resp[2] : "";

  await op.nrepl.loadFile(app, {
    contents: lines.join("\n"),
    fileName,
    filePath,
  });
}

/**
 * Create
 */
export async function create(app: App) {
  if (app.core.current == null) {
    return;
  }

  const nsName = await nameByBuffer(app);
  if (nsName == null) {
    return;
  }

  const key = `ns_create_${nsName}`;
  if (cache.hasItem(key)) {
    return;
  }

  const code = `(when-not (clojure.core/find-ns '${nsName})
                  (clojure.core/create-ns '${nsName}))`;
  const resp = await op.nrepl.evaluate(app, { code, silent: true });
  if (resp.getOne("value") !== "nil") {
    await evaluateOnlyNsForm(app);
  }

  cache.setItem(key, true);
}
