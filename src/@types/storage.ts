import { supportedChains } from "./pathfinder";

export interface ITokenInfo {
  chainId: string;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  logoURI: string;
  tags: string[];
}

export type ITokenInfoList = {
  [key in supportedChains]: ITokenInfo[];
};

export interface IPathStorage {
  [tokenAddress: string]: string[];
}

export type address = string
export type chainId = string
export interface IReFetch {
  [key:chainId]: address[];
}
