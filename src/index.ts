import fs from "fs";
import neatCsv from "neat-csv";
import * as fastcsv from "fast-csv";
import "cross-fetch/polyfill";
import { QueryOptions, ApolloClient, InMemoryCache } from "@apollo/client/core";
import { isValidAddress, toCheckSumAddress } from "./lib/celo";
import { ADDRESS_QUERY } from "./lib/gql";
import { toEpochTimestamp } from "./lib/util";
import { BigNumber } from "bignumber.js";
BigNumber.set({ DECIMAL_PLACES: 10, ROUNDING_MODE: BigNumber.ROUND_HALF_UP });
import dotenv from "dotenv";
dotenv.config();

async function readCsv(filename: string): Promise<any> {
  
  const stream = fs.createReadStream(filename);
  const addresses = await neatCsv(stream); 

  // Skip header row
  for(let i=0; i<addresses.length;i++) {
    if (!isValidAddress(addresses[i].address))
      throw `${addresses[i].address} is not a valid Celo address`;
    else
      addresses[i].address = toCheckSumAddress(addresses[i].address);
  };  

  console.log(`Addresses ${JSON.stringify(addresses)}`);
  return addresses;
}

async function start(
  inputFile: string,
  fromDate: string,
  toDate: string,
  outputFile?: string
): Promise<void> {

  const zero = new BigNumber(0);
  
  console.log(`Input file is ${inputFile}`);
  console.log(`Output file is ${outputFile}`);

  // Parse dates
  let epochFromDate, epochToDate;
  try{
    epochFromDate = toEpochTimestamp(fromDate);
    epochToDate = toEpochTimestamp(toDate);
    console.log(`Date from is ${fromDate} (${epochFromDate})`);
    console.log(`Date from is ${toDate} (${epochToDate})`);
  }
  catch(err){
    console.error("Error parsing dates:" + err);
    throw err;
  }

  // Read file
  let addresses;
  try {    
    addresses = await readCsv(inputFile);
    
  } catch (err) {
    console.error("Error reading CSV file:" + err);
    throw err;
  }

  // Get data
  const results = [];
  try{
    const cache = new InMemoryCache();
    const client = new ApolloClient({
      uri: process.env.GRAPHQL_ENDPOINT,
      cache: cache,
      name: "celo-simple-address-monitor",
      version: "0.0.1",
      queryDeduplication: false
    });

    for(let i = 0; i < addresses.length;i++){
      
      const element = addresses[i];
      console.log(`******************************************************`);
      console.log(`Started data retrieval for ${JSON.stringify(element)}`);

      const variables = { address: element.address, token: process.env.TOKEN, localCurrencyCode: process.env.LOCAL_CURRENCY_CODE }
      const options : QueryOptions = {
        errorPolicy: "all",
        fetchPolicy: "no-cache",
        query: ADDRESS_QUERY,
        variables: variables   
      }
      const response = await client.query(options);  
      const data = response.data;
      console.log(`Completed data retreival for ${addresses[i].address}`);
      console.log();
      
      const totals = {
        totalReceived : zero,
        receivedCount: zero,
        averageReceived : zero,
        totalSent : zero,
        sentCount: zero,
        averageSent : zero,
        totalFees: zero,
        feesCount: zero,
        averageFees: zero,
        averageTransferTime: zero
      }

      for(let j = 0; j<data?.tokenTransactions?.edges.length; j++) {        
        
        const element = data.tokenTransactions.edges[j].node;
        
        // Skip if this node doesn't match the time range
        if(!(element.timestamp >= epochFromDate && element.timestamp < epochToDate )){
          console.log(`Skipping txId ${element.hash} timestamp ${element.timestamp} is out of range ${epochFromDate} to ${epochToDate}`);
          continue;
        }
        else{
          console.log(`Processing txId ${element.hash} `);
        }

        if(element.type === "SENT" || element.type === "EXCHANGE"){          
          totals.totalSent = totals.totalSent.plus(new BigNumber(element.amount.localAmount.value));
          totals.sentCount = totals.sentCount.plus(new BigNumber(1));
          
          for(let k = 0; k < element.fees.length; k++){
            totals.totalFees = totals.totalFees.plus(new BigNumber(element.fees[k].amount.localAmount.value));
            totals.feesCount = totals.feesCount.plus(new BigNumber(1));
          }
        }
        else if (element.type === "RECEIVED") {
          totals.totalReceived = totals.totalReceived.plus(new BigNumber(element.amount.localAmount.value));
          totals.receivedCount = totals.receivedCount.plus(new BigNumber(1));
        }
      };

      // Calculate totals
      totals.averageSent = !totals.sentCount.isEqualTo(zero) ? totals.totalSent.dividedBy(totals.sentCount) : zero;
      totals.averageReceived = !totals.receivedCount.isEqualTo(zero) ? totals.totalReceived.dividedBy(totals.receivedCount): zero;
      totals.averageFees = !totals.feesCount.isEqualTo(zero) ? totals.totalFees.dividedBy(totals.feesCount) : zero;

      const stringTotals = {
        totalReceived : totals.totalReceived.toString(),
        averageReceived :  totals.averageReceived.toString(),
        totalSent :  totals.totalSent.toString(),
        averageSent :  totals.averageSent.toString(),
        totalFees:  totals.totalFees.toString(),
        averageFees:  totals.averageFees.toString(),
        averageTransferTime:  totals.averageTransferTime.toString()
      }
      results.push({ address: addresses[i].address, ...stringTotals});
    };
  }
  catch(err){
    console.error("Error retrieving data:" + err);
    throw err;
  }

  // Tabulate and show
  console.log("");
  console.table(results);

  // Output to file
  if(outputFile != undefined){    
    console.log("")
    const ws = fs.createWriteStream(outputFile);
    fastcsv.write(results, { headers: true }).pipe(ws);
    console.log(`Output written to ${outputFile}. Ending.`);
  }
  else{
    console.log("No output file specified. Ending.");
  }
}

const args = process.argv;
console.log(`Arguments are ${JSON.stringify(args)}`);
// args[0] = executable (/bin/node)
// args[1] = file to be executed (dist/index.js)
start(args[2], args[3], args[4], args[5]);
