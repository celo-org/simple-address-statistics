import { AddressUtils } from "@celo/utils";

export function isValidAddress(address: string): boolean {
  return AddressUtils.isValidAddress(address);
}

export function toCheckSumAddress(address: string): string {
  return AddressUtils.toChecksumAddress(address);
}
