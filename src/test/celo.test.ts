import assert from "assert";
import * as celo from "../lib/celo";
import dotenv from "dotenv";

const result = dotenv.config({ path: ".env-alfajores" });
if (result.error) {
  throw result.error;
}

describe("Should test the celo library", () => {
  it("Should get the timestamp of block 1 mainnet", async () => {
    const timestamp = await celo.getTimestampForBlock(1);
    const expected = 1594921556000;
    assert(
      timestamp === expected,
      `Block 1 timestamp should be ${expected} not ${timestamp}`
    );
  });

  it("Should verify valid address", async () => {
    const address = "0xddaa60B6d803674bBc434F1C2B261CeB67C2fd7c";
    assert(celo.isValidAddress(address));
  });

  it("Should verify invalid address", async () => {
    const address = "0xinvalidinvalidinvalidinvalidinvalidinvali";
    assert(!celo.isValidAddress(address));
  });

  it("Should upgrade to checksum address", async () => {
    const address = celo.toCheckSumAddress(
      "0xddaa60B6d803674bBc434F1C2B261CeB67C2fd7c".toLowerCase()
    );
    assert(address === "0xddaa60B6d803674bBc434F1C2B261CeB67C2fd7c");
  });

  it("Should retrieve transactions for an address on mainnet", async () => {
    const transactions = await celo.getTransactionsForAddress(
      "0x621843731fe33418007C06ee48CfD71e0ea828d9" //cLabs Validator #6
    );
    assert(transactions?.tokenTransactions?.edges.length > 0);
  });
});
