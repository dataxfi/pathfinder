export interface IPoolNode {
  id: string;
  token0: { id: string };
  token1: { id: string };
  totalValueLockedToken0: string;
  totalValueLockedToken1: string;
}
export interface INextTokensToSearch {
  [tokenAdress: number]: { parentToken: string };
}

export interface IPoolGraph {
  [tokenAddress: string]: IPoolNode;
}

export interface ITokenGraph {
  [tokenAddress: string]: { parent: string; pools: IPoolGraph; max:string };
}

export interface IBFSResultPoolNode {
  pool: IPoolNode;
  parent: string;
}
export interface IBFSResults {
  [key: string]: IBFSResultPoolNode;
}

export interface queryParams {
  skipT0: number[];
  skipT1: number[];
  callT0: boolean[];
  callT1: boolean[];
}

export interface requestResponse {
  t0MatchLength: number;
  t1MatchLength: number;
  allMatchedPools: IPoolNode[];
}

export type queryFunction = (address: string[], skipT0: number[], skipT1: number[], callT0: boolean[], callT1: boolean[]) => Promise<requestResponse[]>;
export type supportedChains = "1" | "4" | "56" | "137" | "246" | "1285";
export type succesfulResponse = [string[], string[], number];
export type failedResponse = [string, number];
export type pathfinderResponse = succesfulResponse | failedResponse;
