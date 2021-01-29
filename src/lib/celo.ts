import { AddressUtils } from "@celo/utils";
import { ADDRESS_QUERY, BLOCK_TIMESTAMP_QUERY } from "./gql";
import { QueryOptions, ApolloClient, InMemoryCache } from "@apollo/client/core";
import "cross-fetch/polyfill";

export function isValidAddress(address: string): boolean {
  return AddressUtils.isValidAddress(address);
}

export function toCheckSumAddress(address: string): string {
  return AddressUtils.toChecksumAddress(address);
}

export async function getTransactionsForAddress(address: string): Promise<any> {
  try {
    const cache = new InMemoryCache();
    const client = new ApolloClient({
      uri: process.env.BLOCKCHAIN_API_ENDPOINT,
      cache: cache,
      name: process.env.CLIENT_APPLICATION_NAME,
      version: process.env.CLIENT_APPLICATION_VERSION,
      queryDeduplication: false,
    });
    const variables = {
      address: address,
      token: process.env.TOKEN,
      localCurrencyCode: process.env.LOCAL_CURRENCY_CODE,
    };
    const options: QueryOptions = {
      errorPolicy: "all",
      fetchPolicy: "no-cache",
      query: ADDRESS_QUERY,
      variables: variables,
    };
    const response = await client.query(options);
    const data = response.data;
    console.log(`Completed data retreival for ${address}`);
    return data;
  } catch (err) {
    console.error(
      `Error retrieving transactions for address ${address} - ` + err
    );
    throw err;
  }
}

export async function getTimestampForBlock(
  blockNumber: number
): Promise<number> {
  try {
    const cache = new InMemoryCache();
    const client = new ApolloClient({
      uri: process.env.BLOCKSCOUT_ENDPOINT,
      cache: cache,
      name: process.env.CLIENT_APPLICATION_NAME,
      version: process.env.CLIENT_APPLICATION_VERSION,
      queryDeduplication: true,
    });
    const variables = {
      number: blockNumber,
      operation: "Block",
    };
    const options: QueryOptions = {
      errorPolicy: "all",
      fetchPolicy: "no-cache",
      query: BLOCK_TIMESTAMP_QUERY,
      variables: variables,
    };
    const response = await client.query(options);
    const data = response.data;
    return new Date(data.block.timestamp).getTime();
  } catch (err) {
    console.error(
      `Error retrieving block timestamp for block number ${blockNumber} - ` +
        err
    );
    throw err;
  }
}
