import type { Plugin, ViteDevServer } from "vite";
import fs from "node:fs";
import path from "node:path";

/**
 * Serves ../progress.md and ../plan.md to the app and applies row-level
 * edits back into progress.md. Edits are targeted table-row surgery —
 * never a full-file regenerate — so prose and formatting survive.
 */

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const FILES: Record<string, string> = {
  progress: path.join(REPO_ROOT, "progress.md"),
  plan: path.join(REPO_ROOT, "plan.md"),
};

// ---------- markdown table surgery ----------

export function splitRow(line: string): string[] {
  // "| a | b |" -> ["a", "b"]
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function joinRow(cells: string[]): string {
  return `| ${cells.join(" | ")} |`;
}

function isTableLine(line: string): boolean {
  return /^\s*\|.*\|\s*$/.test(line);
}

function isSeparatorLine(line: string): boolean {
  return /^\s*\|[\s:|-]+\|\s*$/.test(line);
}

/** Locate the first table after the heading whose text contains `sectionMatch`.
 *  Returns [firstDataRowIndex, lastDataRowIndexExclusive] as line indices. */
export function findSectionTable(
  lines: string[],
  sectionMatch: string,
): { start: number; end: number } {
  let headingIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^#{2,3}\s/.test(lines[i]) && lines[i].includes(sectionMatch)) {
      headingIdx = i;
      break;
    }
  }
  if (headingIdx === -1) throw new Error(`Section not found: ${sectionMatch}`);

  // find header row then separator, then data rows
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (/^#{2,3}\s/.test(lines[i])) break; // hit next section, no table
    if (isTableLine(lines[i]) && i + 1 < lines.length && isSeparatorLine(lines[i + 1])) {
      const start = i + 2;
      let end = start;
      while (end < lines.length && isTableLine(lines[end]) && !isSeparatorLine(lines[end])) end++;
      return { start, end };
    }
  }
  throw new Error(`No table found in section: ${sectionMatch}`);
}

export function appendRow(content: string, section: string, cells: string[]): string {
  const lines = content.split("\n");
  const { end } = findSectionTable(lines, section);
  lines.splice(end, 0, joinRow(cells));
  return lines.join("\n");
}

/** Update a row where every column in `match` (index -> exact trimmed value) matches.
 *  Sets columns from `set` (index -> new value). Throws if 0 or 2+ rows match. */
export function updateRow(
  content: string,
  section: string,
  match: Record<number, string>,
  set: Record<number, string>,
): string {
  const lines = content.split("\n");
  const { start, end } = findSectionTable(lines, section);
  const hits: number[] = [];
  for (let i = start; i < end; i++) {
    const cells = splitRow(lines[i]);
    const ok = Object.entries(match).every(([idx, val]) => cells[Number(idx)] === val);
    if (ok) hits.push(i);
  }
  if (hits.length !== 1) {
    throw new Error(`updateRow matched ${hits.length} rows in "${section}" (need exactly 1)`);
  }
  const cells = splitRow(lines[hits[0]]);
  for (const [idx, val] of Object.entries(set)) cells[Number(idx)] = val;
  lines[hits[0]] = joinRow(cells);
  return lines.join("\n");
}

// ---------- operations ----------

export type LedgerOp =
  | { op: "appendRow"; section: string; cells: string[] }
  | { op: "updateRow"; section: string; match: Record<number, string>; set: Record<number, string> };

export function applyOp(content: string, op: LedgerOp): string {
  switch (op.op) {
    case "appendRow":
      return appendRow(content, op.section, op.cells);
    case "updateRow":
      return updateRow(content, op.section, op.match, op.set);
    default:
      throw new Error(`Unknown op: ${(op as { op: string }).op}`);
  }
}

// ---------- plugin ----------

function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

export function ledgerPlugin(): Plugin {
  let isBuild = false;
  let outDir = "dist";
  return {
    name: "ledger-api",
    configResolved(config) {
      isBuild = config.command === "build";
      outDir = config.build.outDir;
    },
    /** Static hosting: emit the ledger as read-only JSON snapshots at the same
     *  /api/file/* paths the dev server serves, so a deployed build reads the
     *  version of progress.md/plan.md that was committed at build time. */
    closeBundle() {
      if (!isBuild) return;
      const dir = path.resolve(import.meta.dirname, outDir, "api", "file");
      fs.mkdirSync(dir, { recursive: true });
      for (const [name, file] of Object.entries(FILES)) {
        fs.writeFileSync(
          path.join(dir, name),
          JSON.stringify({ content: fs.readFileSync(file, "utf8"), static: true }),
          "utf8",
        );
      }
    },
    configureServer(server: ViteDevServer) {
      // notify the client when either file changes on disk
      for (const file of Object.values(FILES)) {
        server.watcher.add(file);
      }
      server.watcher.on("change", (changed) => {
        const hit = Object.entries(FILES).find(
          ([, f]) => path.resolve(changed) === path.resolve(f),
        );
        if (hit) {
          server.ws.send({ type: "custom", event: "ledger:changed", data: { file: hit[0] } });
        }
      });

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";

        if (req.method === "GET" && url.startsWith("/api/file/")) {
          const name = url.slice("/api/file/".length).split("?")[0];
          const file = FILES[name];
          if (!file) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `unknown file: ${name}` }));
            return;
          }
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ content: fs.readFileSync(file, "utf8") }));
          return;
        }

        if (req.method === "POST" && url.startsWith("/api/ledger")) {
          try {
            const op = JSON.parse(await readBody(req)) as LedgerOp;
            const file = FILES.progress;
            const before = fs.readFileSync(file, "utf8");
            const after = applyOp(before, op);
            fs.writeFileSync(file, after, "utf8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, content: after }));
          } catch (e) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: (e as Error).message }));
          }
          return;
        }

        next();
      });
    },
  };
}
