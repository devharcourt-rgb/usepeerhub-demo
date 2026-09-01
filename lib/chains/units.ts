/**
 * Converts a base-unit integer (wei, sun, lamports, ...) to a human amount
 * without the precision loss you'd get from `Number(bigintValue) / 10**d` —
 * that conversion silently loses precision past 2^53, which realistic
 * deposit sizes in 18-decimal assets (ETH, BNB) blow past immediately.
 * The integer part is kept as a BigInt division (safe — deposit whole
 * amounts are always tiny) and the fractional part is built as a string.
 */
export function formatUnits(value: bigint, decimals: number): number {
  const negative = value < BigInt(0);
  const abs = negative ? -value : value;
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = abs / divisor;
  const remainder = abs % divisor;

  const fractionStr = remainder
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");

  const str = fractionStr ? `${whole}.${fractionStr}` : whole.toString();
  const num = parseFloat(str);

  return negative ? -num : num;
}
