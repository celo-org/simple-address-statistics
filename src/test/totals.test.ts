import assert from "assert";
import { Totals, TotalAsString } from "../types";
import { ZERO } from "../lib/util";
import dotenv from "dotenv";
import BigNumber from "bignumber.js";

const result = dotenv.config({ path: ".env-alfajores" });
if (result.error) {
  throw result.error;
}

describe("Should test the Totals class", () => {
  it("Should create a new empty Totals class", async () => {
    const tmp: Totals = new Totals();
    assert(tmp.totalReceived.isEqualTo(ZERO));
    assert(tmp.receivedCount.isEqualTo(ZERO));
    assert(tmp.averageReceived.isEqualTo(ZERO));
    assert(tmp.totalSent.isEqualTo(ZERO));
    assert(tmp.sentCount.isEqualTo(ZERO));
    assert(tmp.averageSent.isEqualTo(ZERO));
    assert(tmp.totalFees.isEqualTo(ZERO));
    assert(tmp.feesCount.isEqualTo(ZERO));
    assert(tmp.averageFees.isEqualTo(ZERO));
    assert(tmp.averageTxTime.isEqualTo(ZERO));
    assert(tmp.txTimeTotal.isEqualTo(ZERO));
  });

  it("Should return a string version of Totals", async () => {
    const tmp: TotalAsString = new Totals().toString();
    assert(tmp);
  });

  it("Should add Totals together", async () => {
    const tmp1: Totals = new Totals();
    tmp1.totalReceived = new BigNumber(5);
    tmp1.receivedCount = new BigNumber(2);
    tmp1.totalSent = new BigNumber(-10);
    tmp1.sentCount = new BigNumber(2);
    tmp1.totalFees = new BigNumber(5);
    tmp1.feesCount = new BigNumber(17);
    tmp1.txTimeTotal = new BigNumber(100000);

    const tmp2: Totals = new Totals();
    tmp2.totalReceived = new BigNumber(5);
    tmp2.receivedCount = new BigNumber(1);
    tmp2.totalSent = new BigNumber(-10);
    tmp2.sentCount = new BigNumber(3);
    tmp2.totalFees = new BigNumber(5);
    tmp2.feesCount = new BigNumber(17);
    tmp2.txTimeTotal = new BigNumber(100000);

    tmp1.plus(tmp2);

    assert(tmp1.totalReceived.isEqualTo(new BigNumber(10))); // adds to 10
    assert(tmp1.receivedCount.isEqualTo(new BigNumber(3))); // adds to 3
    assert(tmp1.totalSent.isEqualTo(new BigNumber(-20))); // adds to -20
    assert(tmp1.sentCount.isEqualTo(new BigNumber(5))); // adds to 5
    assert(tmp1.totalFees.isEqualTo(new BigNumber(10))); // adds to 10
    assert(tmp1.feesCount.isEqualTo(new BigNumber(34))); // adds to 34
    assert(tmp1.txTimeTotal.isEqualTo(new BigNumber(200000))); // adds to 200000
  });

  it("Should add Totals together and calculate averages", async () => {
    const tmp1: Totals = new Totals();
    tmp1.totalReceived = new BigNumber(5);
    tmp1.receivedCount = new BigNumber(2);
    tmp1.totalSent = new BigNumber(-10);
    tmp1.sentCount = new BigNumber(2);
    tmp1.totalFees = new BigNumber(5);
    tmp1.feesCount = new BigNumber(17);
    tmp1.txTimeTotal = new BigNumber(100000);

    const tmp2: Totals = new Totals();
    tmp2.totalReceived = new BigNumber(5);
    tmp2.receivedCount = new BigNumber(1);
    tmp2.totalSent = new BigNumber(-10);
    tmp2.sentCount = new BigNumber(3);
    tmp2.totalFees = new BigNumber(5);
    tmp2.feesCount = new BigNumber(17);
    tmp2.txTimeTotal = new BigNumber(100000);

    tmp1.plus(tmp2);
    tmp1.calculateAverages();
    // console.log(tmp1.toString());

    assert(tmp1.totalReceived.isEqualTo(new BigNumber(10))); // adds to 10
    assert(tmp1.receivedCount.isEqualTo(new BigNumber(3))); // adds to 3
    assert(tmp1.averageReceived.isGreaterThan(new BigNumber(3.33))); // average should be 3.33 recurring..
    assert(tmp1.averageReceived.isLessThan(new BigNumber(3.34))); // average should be 3.33 recurring..

    assert(tmp1.totalSent.isEqualTo(new BigNumber(-20))); // adds to -20
    assert(tmp1.sentCount.isEqualTo(new BigNumber(5))); // adds to 5
    assert(tmp1.averageSent.isEqualTo(new BigNumber(-4))); // averages to exactly -4

    assert(tmp1.totalFees.isEqualTo(new BigNumber(10))); // adds to 10
    assert(tmp1.feesCount.isEqualTo(new BigNumber(34))); // adds to 34
    assert(tmp1.averageFees.isGreaterThan(new BigNumber(0.294117))); // averages to approximatley 0.2941176...
    assert(tmp1.averageFees.isLessThan(new BigNumber(0.294118))); // averages to approximatley 0.2941176...

    assert(tmp1.txTimeTotal.isEqualTo(new BigNumber(200000))); // adds to 200000
    assert(tmp1.averageTxTime.isEqualTo(new BigNumber(25000))); // averages to exactly 25000
  });
});
