import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./db";

describe("Password Auth Helpers", () => {
  it("correctly hashes and verifies passwords", () => {
    const raw = "SuperSecretPassword123!";
    const hashed = hashPassword(raw);

    expect(hashed).toBeTypeOf("string");
    expect(hashed).toContain(":");
    expect(verifyPassword(raw, hashed)).toBe(true);
    expect(verifyPassword("WrongPassword", hashed)).toBe(false);
  });

  it("handles invalid format gracefully", () => {
    expect(verifyPassword("test", "invalid_hash_string_without_colon")).toBe(false);
    expect(verifyPassword("test", "")).toBe(false);
  });
});
