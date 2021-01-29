import { gql } from "@apollo/client/core";

export const BLOCK_TIMESTAMP_QUERY = gql`
  query Block($number: Int!) {
    block(number: $number) {
      timestamp
    }
  }
`;

export const ADDRESS_QUERY = gql`
  query UserTransactions(
    $address: Address!
    $token: Token!
    $localCurrencyCode: String
  ) {
    tokenTransactions(
      address: $address
      token: $token
      localCurrencyCode: $localCurrencyCode
    ) {
      edges {
        node {
          ...TransactionFeed
        }
      }
    }
  }
  fragment TransactionFeed on TokenTransaction {
    ...ExchangeItem
    ...TransferItem
  }
  fragment ExchangeItem on TokenExchange {
    __typename
    type
    hash
    block
    fees {
      type
      amount {
        value
        currencyCode
        localAmount {
          value
          currencyCode
          exchangeRate
        }
      }
    }
    amount {
      value
      currencyCode
      localAmount {
        value
        currencyCode
        exchangeRate
      }
    }
    timestamp
    takerAmount {
      value
      currencyCode
      localAmount {
        value
        currencyCode
        exchangeRate
      }
    }
    makerAmount {
      value
      currencyCode
      localAmount {
        value
        currencyCode
        exchangeRate
      }
    }
  }
  fragment TransferItem on TokenTransfer {
    __typename
    type
    fees {
      type
      amount {
        value
        currencyCode
        localAmount {
          value
          currencyCode
          exchangeRate
        }
      }
    }
    hash
    block
    amount {
      value
      currencyCode
      localAmount {
        value
        currencyCode
        exchangeRate
      }
    }
    timestamp
    address
    #   account
    comment
  }
`;
