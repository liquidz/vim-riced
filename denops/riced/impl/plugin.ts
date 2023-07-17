import { Denops, option, unknownutil, vimFn } from "../deps.ts";

const isStringArray = unknownutil.is.ArrayOf(unknownutil.is.String);

export async function searchPluginPaths(
  denops: Denops,
  pluginNames: string[],
): Promise<Record<string, string>> {
  const runtimepath = await option.runtimepath.getGlobal(denops);
  const result: Record<string, string> = {};

  const path = `denops/@std/**/*.ts`;
  const searched = await vimFn.globpath(denops, runtimepath, path, 1, 1);

  unknownutil.assert(searched, isStringArray);

  console.log(searched);
  // for (const pluginName of pluginNames) {
  //   const path = `denops/@std/${pluginName}.ts`;
  //   const searched = await vimFn.globpath(denops, runtimepath, path, 1, 1);
  //
  //   console.log(searched);
  //   //unknownutil.assertArray<string>(searched);
  //
  //   // if (searched.length === 0) {
  //   //   continue;
  //   // }
  //   //
  //   // if (searched.length > 1) {
  //   //   console.error(
  //   //     `Plugin name '${pluginName}' is matched to several paths(${
  //   //       searched.join(
  //   //         ", ",
  //   //       )
  //   //     }). A plugin name must be unique. Loading this plugin is skipped.`,
  //   //   );
  //   //   continue;
  //   // }
  //   //
  //   // result[pluginName] = searched[0];
  // }
  return result;
}
