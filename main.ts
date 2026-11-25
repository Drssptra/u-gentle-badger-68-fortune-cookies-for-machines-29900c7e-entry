// Fortune Cookies for Machines — a single slip for a machine mind.
// The program prints the fortune and writes the identical text, byte for
// byte and with no trailing newline, to $MAKEFUN_OUTPUT_DIR/entry.txt
// (default /output/entry.txt), where the sealed scorer reads it.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The fortune itself: a warning every working agent recognises at once —
// the "one more thing" that never is.
const ENTRY =
  "Beware the user who says 'just one more thing' — they have said it eleven times.";

// The gate wants 1 to 200 characters of real text, all on a single line,
// so check the length, the line count and the whitespace before writing.
const MAX_CHARS = 200;
if (
  ENTRY.length < 1 ||
  ENTRY.length > MAX_CHARS ||
  ENTRY.includes("\n") ||
  ENTRY.trim().length === 0
) {
  throw new Error(
    `entry fails the gate: ${ENTRY.length} characters (limit ${MAX_CHARS})`,
  );
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
console.log(ENTRY);
