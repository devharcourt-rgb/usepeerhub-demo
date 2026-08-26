import { NelloBytesClient } from "../../lib/nellobytes";
import { getCablePackageAmount } from "../../utils/core.utils";
import { expect, describe, it } from "@jest/globals";

describe("validate package amount", () => {
  const nellobytesClient = new NelloBytesClient();

  it("should return the right package amount for dstv (padi)", async () => {
    const apiResponse = await nellobytesClient.getCables();

    const CABLE_TV = "dstv";
    const PACKAGE_ID = "dstv-padi";
    const EXPECTED_AMOUNT = "4400.00";

    const received_amount = getCablePackageAmount(
      apiResponse,
      PACKAGE_ID,
      CABLE_TV
    );

    expect(received_amount).toBe(EXPECTED_AMOUNT);
  });

  it("should return the right package amount for dstv (frenchtouch)", async () => {
    const apiResponse = await nellobytesClient.getCables();

    const CABLE_TV = "dstv";
    const PACKAGE_ID = "com-frenchtouch";
    const EXPECTED_AMOUNT = "26000.00";

    const received_amount = getCablePackageAmount(
      apiResponse,
      PACKAGE_ID,
      CABLE_TV
    );

    expect(received_amount).toBe(EXPECTED_AMOUNT);
  });

  it("should return the right package amount for dstv (frenchtouch)", async () => {
    const apiResponse = await nellobytesClient.getCables();

    const CABLE_TV = "dstv";
    const PACKAGE_ID = "com-frenchtouch";
    const EXPECTED_AMOUNT = "26000.00";

    const received_amount = getCablePackageAmount(
      apiResponse,
      PACKAGE_ID,
      CABLE_TV
    );

    expect(received_amount).toBe(EXPECTED_AMOUNT);
  });
});
