const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const appBasePath = rawBasePath.endsWith("/") ? rawBasePath.slice(0, -1) : rawBasePath;

export function withBasePath(path: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return path;
  if (!appBasePath || path.startsWith(`${appBasePath}/`) || path === appBasePath) return path;
  return `${appBasePath}${path}`;
}
