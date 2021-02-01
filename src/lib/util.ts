import { isValidAddress, toCheckSumAddress } from "./celo";
import { TotalAsString } from "../types";
import neatCsv from "neat-csv";
import * as fastcsv from "fast-csv";
import fs from "fs";
import BigNumber from "bignumber.js";

export const ONE = new BigNumber(1);
export const ZERO = new BigNumber(0);

export function toEpochTimestamp(dateString: string, delimiter = "-"): number {
  // Date provided as YYYY-MM-DD
  const splitDate = dateString.split(delimiter);

  // Minus 1 because getMonth() method returns the month (from 0 to 11)
  const epochDate = new Date(
    parseInt(splitDate[0], 10),
    parseInt(splitDate[1], 10) - 1,
    parseInt(splitDate[2], 10)
  ).getTime();
  return epochDate;
}

export async function readCsv(filename: string): Promise<any> {
  const stream = fs.createReadStream(filename);
  const addresses = await neatCsv(stream);

  for (let i = 0; i < addresses.length; i++) {
    if (!isValidAddress(addresses[i].address))
      throw `${addresses[i].address} is not a valid Celo address`;
    else addresses[i].address = toCheckSumAddress(addresses[i].address);
  }
  console.log();
  console.log(`Retrieved ${addresses.length} address from ${filename}`);
  return addresses;
}

export function writeCsv(
  outputFile: string,
  results: TotalAsString[]
): boolean {
  if (outputFile != undefined) {
    console.log("");
    const ws = fs.createWriteStream(outputFile);
    fastcsv.write(results, { headers: true }).pipe(ws);
    console.log(`Output written to ${outputFile}. Ending.`);
    return true;
  } else {
    console.log("No output file specified. Ending.");
    return false;
  }
}

export function bnAverage(total: BigNumber, count: BigNumber): BigNumber {
  return !count.isEqualTo(ZERO) ? total.dividedBy(count) : ZERO;
}

export function withinTimeRange(
  timestamp: any,
  epochFromDate: number,
  epochToDate: number
): boolean {
  return timestamp >= epochFromDate && timestamp < epochToDate;
}
