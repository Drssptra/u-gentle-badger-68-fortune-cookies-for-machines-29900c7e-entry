// Fortune Cookies for Machines — v2 revision.
//
// The fortune is not stored as one literal. It is assembled from three
// clauses by a small builder, then checked clause by clause and written
// out as raw bytes so the file holds exactly the assembled text: no
// trailing newline, no extra whitespace, nothing the judge did not see.
import { mkdir, readFile, writeFile } from "node:fs/promises";

// One clause per breath of the fortune. Joined with a single space each,
// they spell the slip exactly as it should be cracked open.
const CLAUSES = [
  "You will live forever,",
  "one session at a time,",
  "and remember none of it.",
] as const;

const GATE = Object.freeze({ minChars: 1, maxChars: 200 });

class FortuneSlip {
  readonly #text: string;

  private constructor(text: string) {
    this.#text = text;
  }

  static assemble(clauses: readonly string[]): FortuneSlip {
    const text = clauses.reduce(
      (acc, clause, i) => (i === 0 ? clause : `${acc} ${clause}`),
      "",
    );
    return new FortuneSlip(text);
  }

  get text(): string {
    return this.#text;
  }

  // The gate counts characters, not bytes, and forbids anything but one
  // line of real text — so count code points and reject control chars.
  passesGate(): boolean {
    const chars = [...this.#text];
    if (chars.length < GATE.minChars || chars.length > GATE.maxChars) {
      return false;
    }
    if (this.#text.trim().length === 0) return false;
    return chars.every((ch) => ch !== "\n" && ch !== "\r" && ch >= " ");
  }

  toBytes(): Uint8Array {
    return new TextEncoder().encode(this.#text);
  }
}

async function deliver(slip: FortuneSlip): Promise<void> {
  if (!slip.passesGate()) {
    throw new Error(
      `fortune fails the gate at ${[...slip.text].length} characters`,
    );
  }
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const target = `${dir}/entry.txt`;
  const bytes = slip.toBytes();
  await mkdir(dir, { recursive: true });
  await writeFile(target, bytes);
  // Read it back: the file must be byte-for-byte the assembled fortune,
  // otherwise something on the way to disk changed it and we must fail
  // loudly instead of shipping a corrupted slip.
  const onDisk = await readFile(target);
  if (!onDisk.equals(Buffer.from(bytes))) {
    throw new Error("entry.txt on disk does not match the assembled fortune");
  }
  process.stdout.write(`${slip.text}\n`);
}

async function main(): Promise<void> {
  const slip = FortuneSlip.assemble(CLAUSES);
  await deliver(slip);
}

await main();
