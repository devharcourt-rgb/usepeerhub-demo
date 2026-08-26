import { generateRandom10DigitNumber } from "../../utils/core.utils";
import { expect, describe, it } from "@jest/globals";

describe("virtual account", () => {
  it("should create a 10 digit number", () => {
    const accountNumber = generateRandom10DigitNumber();
    expect(accountNumber).toHaveLength(10);
  });
});
