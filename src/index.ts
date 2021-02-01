import { toEpochTimestamp, readCsv, writeCsv } from "./lib/util";
import { BigNumber } from "bignumber.js";
import { getTimestampForBlock, getTransactionsForAddress } from "./lib/celo";
import { Totals, TotalAsString } from "./types";

import dotenv from "dotenv";
dotenv.config();

BigNumber.set({ DECIMAL_PLACES: 10, ROUNDING_MODE: BigNumber.ROUND_HALF_UP });
const ZERO = new BigNumber(0);
const ONE = new BigNumber(1);

async function start(
  inputFile: string,
  fromDate: string,
  toDate: string,
  outputFile?: string
): Promise<void> {
  // Show file parms
  console.log(`Input file is ${inputFile}`);
  console.log(`Output file is ${outputFile}`);

  // Show date parms
  let epochFromDate, epochToDate;
  try {
    epochFromDate = toEpochTimestamp(fromDate);
    epochToDate = toEpochTimestamp(toDate);
    console.log(`Date from is ${fromDate} (${epochFromDate})`);
    console.log(`Date from is ${toDate} (${epochToDate})`);
  } catch (err) {
    console.error("Error parsing dates:" + err);
    throw err;
  }

  // Read CSV file for addresses
  let addresses;
  try {
    addresses = await readCsv(inputFile);
  } catch (err) {
    console.error("Error reading CSV file:" + err);
    throw err;
  }

  // Retrieve and process data
  const results = [];
  try {
    for (let i = 0; i < addresses.length; i++) {
      const element = addresses[i];
      console.log();
      console.log(`******************************************************`);
      console.log(`Started data retrieval for ${element.address}`);

      const data = await getTransactionsForAddress(element.address);
      const totals: Totals = new Totals();

      for (let j = 0; j < data?.tokenTransactions?.edges.length; j++) {
        // Process one transaction at a time
        const transaction = data.tokenTransactions.edges[j].node;

        // Skip if this node doesn't match the time range
        if (
          !(
            transaction.timestamp >= epochFromDate &&
            transaction.timestamp < epochToDate
          )
        ) {
          console.log(
            `Skipping txId ${transaction.hash} timestamp ${transaction.timestamp} is out of range ${epochFromDate} to ${epochToDate}`
          );
          continue;
        }

        // Transaction value
        const transactionValue = new BigNumber(transaction.amount.value);

        // Block time estimate (difference between block timestamp and previous block timestamp)
        const blockTimestamp: BigNumber = new BigNumber(
          await getTimestampForBlock(parseInt(transaction.block))
        );
        const previousBlockTimestamp: BigNumber = new BigNumber(
          await getTimestampForBlock(parseInt(transaction.block) - 1)
        );
        const transactionTime: BigNumber = blockTimestamp.minus(
          previousBlockTimestamp
        );
        totals.txTimeTotal = totals.txTimeTotal.plus(transactionTime);
        console.log(
          `Processing txId ${
            transaction.hash
          }, value ${transactionValue.toString()} ${
            process.env.TOKEN
          }, estimate transaction time was ${transactionTime.toString()} `
        );

        // Collate totals for outgoing transactions (value < 0)
        if (transactionValue.isLessThan(ZERO)) {
          totals.totalSent = totals.totalSent.plus(
            new BigNumber(transaction.amount.localAmount.value)
          );
          totals.sentCount = totals.sentCount.plus(ONE);

          // Fees is an array (transaction can have more than one fee type)
          for (let k = 0; k < transaction.fees.length; k++) {
            totals.totalFees = totals.totalFees.plus(
              new BigNumber(transaction.fees[k].amount.localAmount.value)
            );
            totals.feesCount = totals.feesCount.plus(ONE);
          }

          // Collate totals for incoming transactions (value >= 0)
        } else if (transactionValue.isGreaterThanOrEqualTo(ZERO)) {
          totals.totalReceived = totals.totalReceived.plus(
            new BigNumber(transaction.amount.localAmount.value)
          );
          totals.receivedCount = totals.receivedCount.plus(ONE);
        }
      }

      totals.calculateAverages();
      const totalsAsString: TotalAsString = totals.toString();
      results.push({ address: addresses[i].address, ...totalsAsString });
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

const args = process.argv;
console.log(`Arguments are ${JSON.stringify(args)}`);
// args[0] = executable (/bin/node)
// args[1] = file to be executed (dist/index.js)
start(args[2], args[3], args[4], args[5]);
