import Web3 from "web3";
import { failedResponse, IPoolGraph, IPoolNode, ITokenGraph, pathfinderResponse, queryFunction, queryParams, supportedChains } from "../@types";
import { mainnetPools, maticPools } from "../util";
import BigNumber from "bignumber.js";
BigNumber.config({DECIMAL_PLACES: 50})
// bscPools, energywebPools, moonriverPools, rinkebyPools ,
// import fs from "fs";
export default class Pathfinder {
  private fetchFunction: queryFunction;
  public nodes: ITokenGraph;
  public tokensChecked: Set<string>;
  private userTokenIn: string;
  private userTokenOut: string;
  private chainId;
  private allPaths: string[][] = [];
  private depth: number = 0;
  private pathFound: boolean = false;
  private totalAPIRequest: number = 0;
  private maxQueryTime: number = 15;
  private initialQueryParams = { skipT0: [0], skipT1: [0], callT0: [true], callT1: [true] };
  private split = false;

  constructor(chainId: supportedChains, maxQueryTime: number) {
    this.nodes = {};
    this.tokensChecked = new Set();
    this.userTokenIn = "";
    this.userTokenOut = "";
    this.chainId = chainId;
    this.maxQueryTime = maxQueryTime;
    // this.trade = new Trade(web3, chainId);

    switch (Number(this.chainId)) {
      case 4:
        // this.fetchFunction = rinkebyPools;
        break;
      case 137:
        this.fetchFunction = maticPools;
        break;
      case 56:
        // this.fetchFunction = bscPools;
        break;
      case 1285:
        // this.fetchFunction = moonriverPools;
        break;
      case 246:
        // this.fetchFunction = energywebPools;
        break;
      default:
        this.fetchFunction = mainnetPools;
        break;
    }
  }

  /**
   * Adds a pool node to the tokenNodes 'pool' attribute (subgraph).
   * @param poolNode The current poolNode (IPoolNode) from the fetch request iteration.
   * @param tokenNode The tokenNode to add poolNode to its 'pool' attribute.
   */

  private addPoolNode(poolNode: IPoolNode, tokenNode: IPoolGraph) {
    tokenNode[poolNode.id] = poolNode;
  }

  /**
   * Adds a token node to the main graph.
   * @param tokenAdress The address of the token whos pools are being visited.
   * @param parentTokenAddress The IN token preceeding the prospective OUT tokens.
   */

  private addTokenNode(tokenAdress: string, parentTokenAddress: string, max: string) {
    if (!parentTokenAddress) parentTokenAddress = null;
    this.nodes[tokenAdress] = { parent: parentTokenAddress, pools: {}, max };
  }

  /**
   * Makes request for pools associated to a token, sets nodes on the graph for each pool.
   * @param param0
   * @returns The next tokens to be searched OR null if a path can be made.
   */
  public async searchPoolData({
    poolsFromToken,
    tokenAddress,
    destinationAddress,
    parentTokenAddresses,
    parentIndex,
  }: {
    poolsFromToken: IPoolNode[];
    tokenAddress: string;
    destinationAddress: string;
    parentTokenAddresses: string[] | null;
    parentIndex: number;
  }): Promise<string[][] | null> {
    let nextTokensToSearch: string[] = [];
    let nextParentTokenAddresses: string[] = [];

    const half = (x: string) => new BigNumber(x).div(2).toString();

    for (let i = 0; i < poolsFromToken.length; i++) {
      const poolNode = poolsFromToken[i];
      const t1Address = poolNode.token0.id;
      const t2Address = poolNode.token1.id;
      const max = t1Address === tokenAddress ? half(poolNode.totalValueLockedToken0) : half(poolNode.totalValueLockedToken1);

      if (this.nodes[tokenAddress]) {
        this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
      } else {
        const parent = parentTokenAddresses ? parentTokenAddresses[parentIndex] : null;
        this.addTokenNode(tokenAddress, parent, max);
        this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
      }

      const nextTokenAddress = t1Address === tokenAddress ? t2Address : t1Address;
      if (!this.tokensChecked.has(nextTokenAddress)) {
        nextTokensToSearch.push(nextTokenAddress);
        nextParentTokenAddresses.push(tokenAddress);
      }

      // This will resolve if the destination is found, regardless of whether there might be another
      // pool with less fees or more liquidity. The path will be the same even if there is another pool at the current
      // search depth, so fees and liquidity are currently being ignored.
      if (t1Address.toLowerCase() === this.userTokenOut.toLowerCase() || t2Address.toLowerCase() === this.userTokenOut.toLowerCase()) {
        this.addTokenNode(destinationAddress, tokenAddress, max);
        this.pathFound = true;
        return null;
      }
    }

    return [nextTokensToSearch, nextParentTokenAddresses];
  }

  /**
   * Recursively calls subgraphs for all relevant pool data for a token.
   * @param tokenAddress The token to get pools for (token in)
   * @param destinationAddress The token to be attained (token out)
   * @param amt The amount of destination token desired
   * @param IN Wether the exact token is the token in
   * @param parentTokenAddresses the token that was traded prior to the current token being searched (for recursion)
   * @param queryParams pagination for pool data requests (for recursion)
   * @param poolsFromToken all pool data from token (for recursion)
   * @param nextTokensToSearch all tokens to search next (for recursion)
   * @returns next tokens to search
   */
  private async getPoolData({
    tokenAddresses,
    destinationAddress,
    parentTokenAddresses,
    queryParams = this.initialQueryParams,
    poolsFromToken = [],
  }: {
    tokenAddresses: string[];
    destinationAddress: string;
    parentTokenAddresses?: string[] | null;
    poolsFromToken?: IPoolNode[];
    queryParams?: queryParams;
  }): Promise<string[]> {
    if (this.pathFound) {
      return null;
    }

    let thisNextTokensToSearch: string[] | null = null;
    let thisNextParentTokenAddresses: string[] | null = null;

    let { skipT0, skipT1, callT0, callT1 } = queryParams;
    this.totalAPIRequest++;
    const allTokensResponse = await this.fetchFunction(tokenAddresses, this.split, skipT0, skipT1, callT0, callT1);
    for (let i = 0; i < allTokensResponse.length; i++) {
      const response = allTokensResponse[i];
      if (response && response.allMatchedPools.length > 0) {
        const { t0MatchLength, t1MatchLength, allMatchedPools } = response;
        // skip tokens already searched
        const tokenAddress = tokenAddresses[i];
        if (this.tokensChecked.has(tokenAddress)) return;

        if (allMatchedPools.length === 0) return;

        //search all matched pools for user token out
        const searchResponse = await this.searchPoolData({
          poolsFromToken: allMatchedPools,
          tokenAddress,
          destinationAddress,
          parentTokenAddresses,
          parentIndex: i,
        });

        if (searchResponse) {
          const [nextTokensToSearch, nextParentTokenAddresses] = searchResponse;
          if (!thisNextParentTokenAddresses && nextTokensToSearch) {
            thisNextParentTokenAddresses = [];
            thisNextTokensToSearch = [];
          }

          thisNextParentTokenAddresses = [...thisNextParentTokenAddresses, ...nextParentTokenAddresses];
          thisNextTokensToSearch = [...thisNextTokensToSearch, ...nextTokensToSearch];
          this.tokensChecked.add(tokenAddress);
        } else {
          return null;
        }
      }
    }

    if (thisNextTokensToSearch) {
      await this.getPoolData({ tokenAddresses: thisNextTokensToSearch, destinationAddress, parentTokenAddresses: thisNextParentTokenAddresses, poolsFromToken, queryParams });
    }

    return thisNextTokensToSearch;
  }

  /**
   * Get best token path for swap pair.
   * @param param0
   * @returns
   */
  public async getTokenPath({
    tokenAddress,
    destinationAddress,
    split = false,
    abortSignal,
  }: {
    tokenAddress: string;
    destinationAddress: string;
    split: boolean;
    abortSignal?: AbortSignal;
  }): Promise<pathfinderResponse> {
    const timeout: Promise<[string, number]> = new Promise((res, rej) => {
      setTimeout(res, this.maxQueryTime, [tokenAddress, this.totalAPIRequest]);
    });

    const basResponse: failedResponse = [tokenAddress, this.totalAPIRequest];
    const path: Promise<pathfinderResponse> = new Promise(async (resolve, reject) => {
      abortSignal?.addEventListener("abort", () => {
        return reject(new Error("Aborted"));
      });

      try {
        this.split = split;
        this.depth = 0;
        this.nodes = {};
        this.pathFound = false;
        this.allPaths = [];
        this.tokensChecked = new Set();

        tokenAddress = tokenAddress.toLowerCase();
        destinationAddress = destinationAddress.toLowerCase();

        this.userTokenIn = tokenAddress;
        this.userTokenOut = destinationAddress;

        if (tokenAddress === destinationAddress) {
          return resolve([[tokenAddress], [], this.totalAPIRequest]);
        }

        if (this.totalAPIRequest === 999) {
          resolve(basResponse);
        }

        await this.getPoolData({ tokenAddresses: [tokenAddress], destinationAddress });

        if (this.nodes[destinationAddress]) {
          const [path, amts] = this.constructPath({ destination: this.userTokenOut });
          console.log("Total API requests: ", this.totalAPIRequest);
          return resolve([path, amts, this.totalAPIRequest]);
        }
      } catch (error) {
        return resolve(basResponse);
      }
    });

    return Promise.race([timeout, path]);
  }

  /**
   * Follows data from destination token to token in.
   * @param param0
   * @returns path as a string[]
   */
  private constructPath({ path, destination }: { path?: string[]; destination?: string }) {
    try {
      let parent: string;

      if (path) {
        parent = this.nodes[path[0]].parent;
      } else {
        const { parent: next, max } = this.nodes[destination];
        path = [destination];
        parent = next;
      }

      if (parent) {
        path.unshift(parent);
        this.constructPath({ path });
      }

      const amts = path.map((address) => this.nodes[address].max);
      return [path, amts];
    } catch (error) {
      console.error(error);
    }
  }
}



// console.log("Response from search data: ", nextTokensToSearch);
// three things need to happen at this point if the destination address was not found

// //1. if there are more pools for the token then more data needs to be fetched and searched.
// if (nextTokensToSearch && (t0MatchLength === 1000 || t1MatchLength === 1000)) {
//   if (t0MatchLength === 1000) {
//     skipT0[index] += 1000;
//     callT0[index] = true;
//   } else {
//     callT0[index] = false;
//   }

//   if (t1MatchLength === 1000) {
//     skipT1[index] += 1000;
//     callT1[index] = true;
//   } else {
//     callT1[index] = false;
//   }

//   const newQueryParams: queryParams = {
//     skipT0,
//     skipT1,
//     callT0,
//     callT1,
//   };

//   //console.log("Getting more pool data.");
//   await this.getPoolData({
//     tokenAddress,
//     destinationAddress,
//     parentTokenAddress,
//     amt,
//     IN,
//     poolsFromToken,
//     nextTokensToSearch,
//     queryParams: newQueryParams,
//   });
// }

//2. there are no more pools for the current token, so the pools at the next depth need to be searched
// iterate through next tokens to search, search every token this token has pools with before going deeper (most likely has pool with native)
// if (!skipRecurse && nextTokensToSearch && Object.keys(nextTokensToSearch).length > 0) {
//   const promises = [];
//   for (let [token, value] of Object.entries(nextTokensToSearch)) {
//     // push a promise for each request to getPoolData to promises array
//     promises.push(this.getPoolData({ destinationAddress, tokenAddress: token, parentTokenAddress: value.parent, amt: value.amt, IN, skipRecurse: true }));
//   }

//   // check if token was found or aggregate next pools to search
//   const allSettled = await Promise.allSettled(promises);
//   const tokenFound = allSettled.some((batch) => {
//     if (batch.status === "fulfilled") {
//       if (batch.value === null) {
//         return true;
//       } else {
//         nextTokensToSearch = { ...nextTokensToSearch, ...batch.value };
//       }
//     }
//   });

//   // if pool is found there are no next tokens to search
//   if (tokenFound) nextTokensToSearch = null;
// }
