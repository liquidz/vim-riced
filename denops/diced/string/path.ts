export function normalize(path: string): string {
  if (path.startsWith("file:")) {
    return path.replace(/^file:/, "");
  }

  // NOTE: jar:file:/path/to/jarfile.jar!/path/to/file.clj
  if (path.startsWith("jar:file:")) {
    return path.replace(/^jar:file:/, "zipfile:").replace("!/", "::");
  }

  return path;
}
