import BigNumber from "bignumber.js";
import { bnAverage } from "./lib/util";

const ZERO = new BigNumber(0);
export interface TotalAsString {
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
export class Totals {
  totalReceived: BigNumber = ZERO;
  receivedCount: BigNumber = ZERO;
  averageReceived: BigNumber = ZERO;
  totalSent: BigNumber = ZERO;
  sentCount: BigNumber = ZERO;
  averageSent: BigNumber = ZERO;
  totalFees: BigNumber = ZERO;
  feesCount: BigNumber = ZERO;
  averageFees: BigNumber = ZERO;
  averageTransferTime: BigNumber = ZERO;
  txTimeTotal: BigNumber = ZERO;
  averageTxTime: BigNumber = ZERO;

  toString(): TotalAsString {
    return {
      totalReceived: this.totalReceived.toString(),
      receivedCount: this.receivedCount.toString(),
      averageReceived: this.averageReceived.toString(),
      totalSent: this.totalSent.toString(),
      sentCount: this.sentCount.toString(),
      averageSent: this.averageSent.toString(),
      totalFees: this.totalFees.toString(),
      feesCount: this.feesCount.toString(),
      averageFees: this.averageFees.toString(),
      averageTransferTime: this.averageTransferTime.toString(),
      txTimeTotal: this.txTimeTotal.toString(),
      averageTxTime: this.averageTxTime.toString(),
    };
  }

  calculateAverages(): void {
    this.averageSent = bnAverage(this.totalSent, this.sentCount);
    this.averageReceived = bnAverage(this.totalReceived, this.receivedCount);
    this.averageFees = bnAverage(this.totalFees, this.feesCount);
    this.averageTxTime = bnAverage(
      this.txTimeTotal,
      this.sentCount.plus(this.receivedCount)
    );
  }
}
