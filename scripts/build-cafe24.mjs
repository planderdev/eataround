import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const tempDir = join(rootDir, ".cafe24-tmp");
const deployDir = join(rootDir, "deploy", "cafe24", "eataround");
const command = process.platform === "win32" ? "cmd.exe" : "npx";
const args = process.platform === "win32" ? ["/c", "npx.cmd", "next", "build"] : ["next", "build"];
const env = {
  ...process.env,
  CAFE24_EXPORT: "1",
  NEXT_PUBLIC_BASE_PATH: "/eataround",
};

const copyEntries = [
  "app",
  "components",
  "lib",
  "public",
  "types",
  "next-env.d.ts",
  "next.config.ts",
  "package.json",
  "tsconfig.json",
];

const staticSearchParamPages = [
  "app/(site)/experiences/page.tsx",
  "app/(site)/local-experiences/page.tsx",
  "app/(site)/curations/page.tsx",
  "app/(site)/events/page.tsx",
  "app/(site)/events/ended/page.tsx",
  "app/(site)/journal/page.tsx",
  "app/(site)/search/page.tsx",
];

function copySource() {
  rmSync(tempDir, { recursive: true, force: true });
  mkdirSync(tempDir, { recursive: true });

  for (const entry of copyEntries) {
    const source = join(rootDir, entry);
    if (existsSync(source)) {
      copyEntry(source, join(tempDir, entry));
    }
  }

  rmSync(join(tempDir, "app", "api"), { recursive: true, force: true });
}

function copyEntry(source, destination) {
  if (process.platform !== "win32") {
    cpSync(source, destination, { recursive: true });
    return;
  }

  const result = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      `Copy-Item -LiteralPath '${escapePowerShellPath(source)}' -Destination '${escapePowerShellPath(destination)}' -Recurse -Force`,
    ],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function escapePowerShellPath(path) {
  return path.replaceAll("'", "''");
}

function forceStaticSearchParamPages() {
  for (const filePath of staticSearchParamPages) {
    const absolutePath = join(tempDir, filePath);
    if (!existsSync(absolutePath)) continue;

    const source = readFileSync(absolutePath, "utf8");
    if (source.includes('export const dynamic = "force-static"')) continue;

    writeFileSync(absolutePath, `${source.trimEnd()}\n\nexport const dynamic = "force-static";\n`);
  }
}

function writeCafe24Files() {
  writeFileSync(
    join(deployDir, ".htaccess"),
    ["DirectoryIndex index.html", "ErrorDocument 404 /eataround/404.html", ""].join("\n"),
  );

  writeFileSync(
    join(deployDir, "UPLOAD_GUIDE.txt"),
    [
      "Cafe24 upload target",
      "https://plandertest2.mycafe24.com/eataround",
      "",
      "Upload every file and folder inside this directory to the Cafe24 /eataround folder.",
      "The build uses NEXT_PUBLIC_BASE_PATH=/eataround, so _next, assets, css, js, and image URLs are generated for the subfolder path.",
      "",
      "Note: this is a static export for Cafe24 file hosting. API/database actions require the later backend deployment.",
      "",
    ].join("\n"),
  );
}

copySource();
forceStaticSearchParamPages();

const result = spawnSync(command, args, {
  cwd: tempDir,
  env,
  shell: false,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

rmSync(deployDir, { recursive: true, force: true });
mkdirSync(dirname(deployDir), { recursive: true });
copyEntry(join(tempDir, "out"), deployDir);
writeCafe24Files();
