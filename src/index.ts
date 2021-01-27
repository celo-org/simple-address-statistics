import fs from "fs";
import neatCsv from "neat-csv";
import "cross-fetch/polyfill";
import { QueryOptions, ApolloClient, InMemoryCache } from "@apollo/client/core";
import { isValidAddress, toCheckSumAddress } from "./lib/celo";
import { ADDRESS_QUERY } from "./lib/gql";
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
  
  console.log(`Input file is ${inputFile}`);

  let addresses;
  try {    
    addresses = await readCsv(inputFile);
    
  } catch (err) {
    console.error(err);
    throw err;
  }

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
      console.log(`Processing ${JSON.stringify(element)}`);
      const variables = { address: element.address, token: process.env.TOKEN, localCurrencyCode: process.env.LOCAL_CURRENCY_CODE }
      const options : QueryOptions = {
        errorPolicy: "all",
        fetchPolicy: "no-cache",
        query: ADDRESS_QUERY,
        variables: variables   
      }
      const {data} = await client.query(options);    
      console.log(JSON.stringify(data));

    };
  }
  catch(err){
    console.error(err);
    throw err;
  }
}

const args = process.argv;
console.log(`Arguments are ${JSON.stringify(args)}`);
// args[0] = executable (/bin/node)
// args[1] = file to be executed (dist/index.js)
start(args[2], args[3], args[4], args[5]);
