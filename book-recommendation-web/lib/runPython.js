import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

export function resolvePythonCmd() {
  return process.platform === "win32" ? "python" : "python3";
}

export function resolveRecommendScript() {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, "..", "recommend.py"),
    path.resolve(cwd, "..", "book-recommendation-app", "recommend.py"),
    path.resolve(cwd, "recommend.py"),
  ];
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return candidates[0];
}

export async function runRecommend(args = []) {
  const cmd = resolvePythonCmd();
  const script = resolveRecommendScript();

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, ["-u", script, ...args], {
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      windowsHide: true,
    });

    let out = Buffer.alloc(0);
    let err = Buffer.alloc(0);
    child.stdout.on("data", (c) => (out = Buffer.concat([out, c])));
    child.stderr.on("data", (c) => (err = Buffer.concat([err, c])));
    child.on("error", reject);
    child.on("close", (code) => {
      const text = out.toString("utf-8");
      if (code !== 0) {
        const e = new Error(`Python exited with code ${code}: ${err.toString("utf-8")}`);
        e.code = code;
        e.stdout = text;
        e.stderr = err.toString("utf-8");
        return reject(e);
      }
      try {
        const json = JSON.parse(text || "null");
        resolve(json);
      } catch (e) {
        reject(new Error(`Geçersiz JSON çıktı: ${text}`));
      }
    });
  });
}

