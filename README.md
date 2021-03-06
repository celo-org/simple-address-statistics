# simple-address-statistics
Basic transaction statistics for a token (like cUSD), for supplied Celo addresses for a date range.

## Install / build / test
`yarn / yarn build / yarn coverage` 

## Config
Update the `.env` file as per the following
```
BLOCKCHAIN_API_ENDPOINT=https://blockchain-api-dot-celo-mobile-mainnet.appspot.com/
BLOCKSCOUT_ENDPOINT=https://explorer.celo.org/graphql
TOKEN=cUSD
LOCAL_CURRENCY_CODE=EUR
CLIENT_APPLICATION_NAME=simple-address-statistics
CLIENT_APPLICATION_VERSION=0.0.1
```
Important: final values are represented on screen and written to file are in the local currency defined here.
## Usage

`yarn start inputFile dateFrom dateTo [outputFile]`

* `inputFile` - Filename for input file to read addresses from (see sample.csv for file format)
* `dateFrom` - Start date range in format YYYY-MM-DD
* `dateTo` - End date range in format YYYY-MM-DD
* `ouputFile` - Optional filename for CSV file to ouput results to (if not supplied, only prints to screen)

Note - date ranges are converted to epoch timestamps and the data is filtered where `block.timestamp` >= `dateFrom` and `block.timestamp` < `dateTo`
## Output Format
Important - all the values here are represented in the local currency defined in the `.env`, and converted using the currency rate at the time of the transaction timestamp.

* `address` - Celo address 
* `totalReceived` - Total received in the configured token (cUSD, in the example `.env`)
* `averageReceived` - Average amount received
* `totalSent` - Total sent in the configured token (cUSD, in the example `.env`). Note that these are negative values, representing the token leaving the account
* `averageSent` - Average amount sent (including exchange)
* `totalFees` - Total amount of fees for all send/exchange transactions. (Received transactions are not included, as the sender, not recipient address, pays the fee)
* `averageFees` - Average of all fees
* `averageTransferTime` - Average block time for all transactions
* `txTimeTotal` - Total block time (mined block timestamp minus previous mined block timestamp) for all transactions
* `averageTxTime` - Average of all block times (should converge to 5000 ms on the Celo network)
## Example
`yarn start ./sample.csv 2020-04-22 2021-12-31 ./output.csv`

![example.png](./example.png)
