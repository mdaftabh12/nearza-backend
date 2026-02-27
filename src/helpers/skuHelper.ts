import crypto from "crypto";

/**
 * Generates a unique SKU from product name
 * Format: PRD-<NAME_PREFIX>-<HEX_SUFFIX>
 * e.g. PRD-WIRE-A3F2C1
 */
export const generateSKU = (name: string): string => {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(4, "X");

  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars

  return `PRD-${prefix}-${suffix}`;
};
