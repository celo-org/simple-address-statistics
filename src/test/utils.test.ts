import assert from "assert";
import * as utils from "../lib/util";
import dotenv from "dotenv";
import { Totals } from "../types";
import { BigNumber } from "bignumber.js";

const result = dotenv.config({ path: ".env-alfajores" });
if (result.error) {
  throw result.error;
}

describe("Should test the utils library", () => {
  it("Should test the epoch time", async () => {
    const input = "2021-02-01";
    const epochTime = utils.toEpochTimestamp(input);
    const expected = 1612134000000;
    assert(
      epochTime == expected,
      `Epoch time for ${input} should be ${expected}, not ${epochTime}`
    );
  });

  it("Should read a sample CSV", async () => {
    const result = await utils.readCsv("./sample.csv");
    assert(result.length === 4);
  });

  it("Should read a sample CSV with invalid data and fail", async () => {
    try {
      await utils.readCsv("./badSample.csv");
      assert.fail();
    } catch (e) {
      assert(e);
    }
  });

  it("Should write a sample CSV", async () => {
    const tmp = new Totals().toString();
    const results = [
      { address: "0x1", ...tmp },
      { address: "0x2", ...tmp },
      { address: "0x3", ...tmp },
    ];
    assert(utils.writeCsv("./testOutput.csv", results));
  });

  it("Should not write a sample CSV if no file supplied", async () => {
    const tmp = new Totals().toString();
    const results = [
      { address: "0x1", ...tmp },
      { address: "0x2", ...tmp },
      { address: "0x3", ...tmp },
    ];
    assert(!utils.writeCsv(null, results));
  });

  it("Should use BigNumber to calculate an average", async () => {
    const result = utils.bnAverage(new BigNumber(15), new BigNumber(20));
    assert(result.isEqualTo(new BigNumber(0.75)));
  });

  it("Should use BigNumber to calculate an average of zero where the count is zero", async () => {
    const result = utils.bnAverage(new BigNumber(15), new BigNumber(0));
    assert(result.isEqualTo(new BigNumber(0)));
  });
});
