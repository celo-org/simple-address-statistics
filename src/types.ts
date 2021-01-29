import BigNumber from "bignumber.js";

export interface AddressTotal {
  totalReceived: BigNumber;
  receivedCount: BigNumber;
  averageReceived: BigNumber;
  totalSent: BigNumber;
  sentCount: BigNumber;
  averageSent: BigNumber;
  totalFees: BigNumber;
  feesCount: BigNumber;
  averageFees: BigNumber;
  averageTransferTime: BigNumber;
  txTimeTotal: BigNumber;
  averageTxTime: BigNumber;
}

export interface AddressTotalDisplay {
  totalReceived: string;
  receivedCount: string;
  averageReceived: string;
  totalSent: string;
  sentCount: string;
  averageSent: string;
  totalFees: string;
  feesCount: string;
  averageFees: string;
  averageTransferTime: string;
  txTimeTotal: string;
  averageTxTime: string;
}
