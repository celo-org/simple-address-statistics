import {
  toEpochTimestamp,
  readCsv,
  writeCsv,
  withinTimeRange,
  ONE,
  ZERO,
} from "./lib/util";
import { BigNumber } from "bignumber.js";
import { getTimestampForBlock, getTransactionsForAddress } from "./lib/celo";
import { Totals, TotalAsString } from "./types";

import dotenv from "dotenv";
dotenv.config();

BigNumber.set({ DECIMAL_PLACES: 10, ROUNDING_MODE: BigNumber.ROUND_HALF_UP });

async function processTransaction(
  transaction: any,
  epochFromDate: number,
  epochToDate: number
): Promise<Totals> {
  const stats: Totals = new Totals();

  if (!withinTimeRange(transaction.timestamp, epochFromDate, epochToDate)) {
    console.log(
      `Skipping txId ${transaction.hash} timestamp ${transaction.timestamp} is out of range ${epochFromDate} to ${epochToDate}`
    );
  } else {
    console.log(`Processing txId ${transaction.hash} ...`);
    const transactionValue = new BigNumber(transaction.amount.value);

    //
    // 1. Block time estimate (difference between block timestamp and previous block timestamp)
    //
    const promises = [
      getTimestampForBlock(parseInt(transaction.block)),
      getTimestampForBlock(parseInt(transaction.block) - 1),
    ];
    const timestamps = await Promise.all(promises);
    const blockTimestamp = new BigNumber(timestamps[0]);
    const previousBlockTimestamp = new BigNumber(timestamps[1]);
    const transactionTime: BigNumber = blockTimestamp.minus(
      previousBlockTimestamp
    );
    stats.txTimeTotal = transactionTime;

    //
    // 2. Collate totals for outgoing transactions (value < 0)
    //
    if (transactionValue.isLessThan(ZERO)) {
      stats.totalSent = new BigNumber(transaction.amount.localAmount.value);
      stats.sentCount = ONE;

      // 2.5 Fees is an array (transaction can have more than one fee type)
      for (let k = 0; k < transaction.fees.length; k++) {
        stats.totalFees = stats.totalFees.plus(
          new BigNumber(transaction.fees[k].amount.localAmount.value)
        );
        stats.feesCount = stats.feesCount.plus(ONE);
      }

      //
      // 3. Collate totals for incoming transactions (value >= 0)
      //
    } else if (transactionValue.isGreaterThanOrEqualTo(ZERO)) {
      stats.totalReceived = new BigNumber(transaction.amount.localAmount.value);
      stats.receivedCount = ONE;
    }
  }
  // console.log(stats);
  return stats;
}

async function start(
  inputFile: string,
  fromDate: string,
  toDate: string,
  outputFile?: string
): Promise<void> {
  // Convert to epoch time
  let epochFromDate, epochToDate;
  try {
    epochFromDate = toEpochTimestamp(fromDate);
    epochToDate = toEpochTimestamp(toDate);
  } catch (err) {
    console.error("Error parsing dates:" + err);
    throw err;
  }

  // Show parameters
  const parms = {
    inputFile: inputFile,
    outputFile: outputFile,
    fromDate: fromDate,
    epochFromDate: epochFromDate,
    toDate: toDate,
    epochToDate: epochToDate,
  };
  console.log();
  console.table(parms);

  // Read CSV file for addresses
  let addresses;
  try {
    addresses = await readCsv(inputFile);
  } catch (err) {
    console.error("Error reading CSV file:" + err);
    throw err;
  }

  const results = [];

  // Retrieve all transactions asynchronously
  const transactionPromises = addresses.map((element) =>
    getTransactionsForAddress(element.address)
  );
  const transactions = await Promise.all(transactionPromises);
  for (let i = 0; i < addresses.length; i++) {
    addresses[i]["transactions"] = transactions[i];
  }

  // Process transactions
  try {
    for (let i = 0; i < addresses.length; i++) {
      const element = addresses[i];
      const totals: Totals = new Totals();

      console.log();
      console.log(`******************************************************`);
      console.log(`Started transaction data processing for ${element.address}`);

      // Process all transactions
      const promises = element.transactions?.tokenTransactions?.edges.map(
        async (element) =>
          processTransaction(element.node, epochFromDate, epochToDate)
      );
      const transactionResults = await Promise.all(promises);

      // Add all results together
      for (let j = 0; j < transactionResults.length; j++) {
        totals.plus(transactionResults[j]);
      }

      // Average
      totals.calculateAverages();

      // Prepare for display and output
      const totalsAsString: TotalAsString = totals.toString();
      results.push({ address: element.address, ...totalsAsString });
    }
  } catch (err) {
    console.error("Error processing data:" + err);
    throw err;
  }

  // Tabulate and show
  console.log("");
  console.table(results);

  // Output to file
  writeCsv(outputFile, results);
}

// Async block at top level
(async () => {
  try {
    const args = process.argv;
    console.log(`Arguments are ${JSON.stringify(args)}`);
    // args[0] = executable (/bin/node)
    // args[1] = file to be executed (dist/index.js)
    await start(args[2], args[3], args[4], args[5]);
  } catch (err) {
    console.error(err);
    throw err;
  }
})();
