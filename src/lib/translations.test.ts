import { describe, expect, it } from "vitest";
import { legalDocs } from "../data/legal";
import { messages } from "./translations";

type Leaf = { path: string; value: unknown };

function leaves(value: unknown, path = ""): Leaf[] {
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  }
  return [{ path, value }];
}

const shape = (value: unknown) => leaves(value).map((l) => l.path).sort();

describe.each([
  ["translations", messages],
  ["legal docs", legalDocs],
] as const)("%s", (_name, byLang) => {
  const langs = Object.keys(byLang) as (keyof typeof byLang)[];

  it("covers en, ru and kz", () => {
    expect(langs.sort()).toEqual(["en", "kz", "ru"]);
  });

  // TS only checks keys; this also catches arrays (steps, sections) with different lengths.
  it.each(["ru", "kz"] as const)("%s has exactly the same structure as en", (lang) => {
    expect(shape(byLang[lang])).toEqual(shape(byLang.en));
  });

  it.each(["en", "ru", "kz"] as const)("%s has no empty strings", (lang) => {
    const empty = leaves(byLang[lang]).filter((l) => typeof l.value === "string" && !l.value.trim());
    expect(empty.map((l) => l.path)).toEqual([]);
  });
});
