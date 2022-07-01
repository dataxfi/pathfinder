import Web3 from "web3";
import { IPoolGraph, IPoolNode, ITokenGraph, queryFunction, queryParams, supportedChains } from "../@types";
import { mainnetPools, maticPools } from "../util";
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
  private initialQueryParams = { skipT0: [0], skipT1: [0], callT0: [true], callT1: [true] };

  constructor(chainId: supportedChains) {
    this.nodes = {};
    this.tokensChecked = new Set();
    this.userTokenIn = "";
    this.userTokenOut = "";
    this.chainId = chainId;
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

  private addTokenNode(tokenAdress, parentTokenAddress) {
    if (!parentTokenAddress) parentTokenAddress = null;
    this.nodes[tokenAdress] = { parent: parentTokenAddress, pools: {} };
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
    let nextParentTokenAddresses: string[] = []
    // //console.log("Searching pools", nextTokensToSearch, poolsFromToken);

    return new Promise(async (resolve, reject) => {
      try {
        //iterate pools response adding nodes
        for (let i = 0; i < poolsFromToken.length; i++) {
          const poolNode = poolsFromToken[i];
          const t1Address = poolNode.token0.id;
          const t2Address = poolNode.token1.id;

          if (this.nodes[tokenAddress]) {
            this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
          } else {
            const parent = parentTokenAddresses ? parentTokenAddresses[parentIndex] : null;
            this.addTokenNode(tokenAddress, parent);
            this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
          }

          const nextTokenAddress = t1Address === tokenAddress ? t2Address : t1Address;
          nextTokensToSearch.push(nextTokenAddress);
          nextParentTokenAddresses.push(tokenAddress);

          // This will resolve if the destination is found, regardless of whether there might be another
          // pool with less fees or more liquidity. The path will be the same even if there is another pool at the current
          // search depth, so fees and liquidity are currently being ignored.
          if (t1Address.toLowerCase() === this.userTokenOut.toLowerCase() || t2Address.toLowerCase() === this.userTokenOut.toLowerCase()) {
            //console.log("Match found, resolving null.");
            this.addTokenNode(destinationAddress, tokenAddress);
            this.pathFound = true;
            resolve(null);
            return;
          }
        }

        resolve([nextTokensToSearch, nextParentTokenAddresses]);
      } catch (error) {
        reject(error);
      }
    });
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
    skipRecurse = false,
  }: {
    tokenAddresses: string[];
    destinationAddress: string;
    parentTokenAddresses?: string[] | null;
    poolsFromToken?: IPoolNode[];
    queryParams?: queryParams;
    skipRecurse?: boolean;
  }): Promise<string[]> {
    if (this.pathFound) {
      //console.log("Path already found, returning.");
      return null;
    }

    let thisNextTokensToSearch = null;
    let thisNextParentTokenAddresses = null;

    let { skipT0, skipT1, callT0, callT1 } = queryParams;
    const allTokensResponse = await this.fetchFunction(tokenAddresses, skipT0, skipT1, callT0, callT1);

    console.log(allTokensResponse);
    console.log(allTokensResponse[0].allMatchedPools);
    try {
      allTokensResponse.forEach(async (response, index) => {
        // skip tokens already searched
        const tokenAddress = tokenAddresses[index];
        if (this.tokensChecked.has(tokenAddress)) return;

        let t0MatchLength: number = 0,
          t1MatchLength: number = 0,
          allMatchedPools: IPoolNode[] = [];

        t0MatchLength = response.t0MatchLength;
        t1MatchLength = response.t1MatchLength;
        allMatchedPools = response.allMatchedPools;
        if (allMatchedPools.length === 0) return;

        poolsFromToken.push(...allMatchedPools);

        //search all matched pools for user token out
        const [nextTokensToSearch, nextParentTokenAddresses] = await this.searchPoolData({
          poolsFromToken,
          tokenAddress,
          destinationAddress,
          parentTokenAddresses,
          parentIndex: index,
        });

        console.log(nextTokensToSearch, nextParentTokenAddresses)
        thisNextParentTokenAddresses = nextParentTokenAddresses
        thisNextTokensToSearch = nextTokensToSearch
        //console.log("Response from search data: ", nextTokensToSearch);
        //three things need to happen at this point if the destination address was not found

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

        // if the previous condition didnt pass, then all pools have been searched for this token
        this.tokensChecked.add(tokenAddress);

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
      });

      // // console.log("Response for " + tokenAddress, response);
      console.log(thisNextTokensToSearch, thisNextParentTokenAddresses)

      if (thisNextTokensToSearch) {
        await this.getPoolData({ tokenAddresses: thisNextTokensToSearch, destinationAddress, parentTokenAddresses: thisNextParentTokenAddresses, poolsFromToken, queryParams });
      }

      return thisNextTokensToSearch;
    } catch (error) {
      console.error("An error occured:", error);
    }
  }

  /**
   * Gets token paths for a swap pair. Recursively calls itself until userTokenOut is found.
   * @param param0
   * @returns An array of tokens to be traded in order to route to the destination token in the shortest path possible.
   */
  private async getTokenPaths({ tokenAddress, destinationAddress }: { tokenAddress: string; destinationAddress: string }): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        //console.log("Calling initial request for pool data :", { tokenAddress, destinationAddress, parentTokenAddress, amt, IN });
        const nextTokensToSearch = await this.getPoolData({ tokenAddresses: [tokenAddress], destinationAddress });
        console.log("Initial call to pool data has resolved, nextTokensToSearch is truthy:", nextTokensToSearch);

        // const nextPromises = [];
        // if (nextTokensToSearch && Object.keys(nextTokensToSearch).length > 0) {
        //console.log("No token found for this depth, dispatching next depth with:", Object.entries(nextTokensToSearch).length);
        // for (let [token, value] of Object.entries(nextTokensToSearch)) {
        // if (!this.pathFound && nextTokensToSearch) nextPromises.push(this.getTokenPaths({ destinationAddress, tokenAddress: token, parentTokenAddress: value.parent, amt: value.amt, IN }));
        // }
        // }

        //console.log("Total promises made:", nextPromises.length);
        // await Promise.allSettled(nextPromises);
        //console.log("All promises settled");

        if (!nextTokensToSearch && this.nodes[destinationAddress]) {
          const path = this.constructPath({ destination: this.userTokenOut });
          if (path) {
            this.allPaths.push(path);
          }
          resolve("Path found");
        } else {
          resolve("No path found");
        }
      } catch (error) {
        console.error(error);
      }
    });
  }

  /**
   * Get best token path for swap pair.
   * @param param0
   * @returns
   */
  public async getTokenPath({ tokenAddress, destinationAddress, abortSignal }: { tokenAddress: string; destinationAddress: string; abortSignal?: AbortSignal }): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      abortSignal?.addEventListener("abort", () => {
        return reject(new Error("Aborted"));
      });
      try {
        this.depth = 0;
        this.nodes = {};
        this.pathFound = false;
        this.allPaths = [];
        this.tokensChecked = new Set();
        // this.totalAPIRequest = 0;

        tokenAddress = tokenAddress.toLowerCase();
        destinationAddress = destinationAddress.toLowerCase();

        if (!this.userTokenIn) this.userTokenIn = tokenAddress;
        if (!this.userTokenOut) this.userTokenOut = destinationAddress;

        if (tokenAddress === destinationAddress) {
          return resolve([tokenAddress]);
        }

        //console.log("Calling get token paths");
        await this.getTokenPaths({ tokenAddress, destinationAddress });
        //console.log("Calling resolve all paths");
        const path = await this.resolveAllPaths();
        console.log("Total API requests: ", this.totalAPIRequest);
        return resolve(path);
      } catch (error) {
        console.error(error);
      }
    });
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
        path = [destination];
        parent = this.nodes[destination].parent;
      }

      if (parent) {
        path.unshift(parent);
        this.constructPath({ path });
      }
      return path;
    } catch (error) {
      console.error(error);
    }
  }

  private async resolveAllPaths() {
    let shortestPath: string[];
    //console.log("All possible paths:", this.allPaths);
    const allPathsResolved = await Promise.allSettled(this.allPaths);
    allPathsResolved.forEach((promise) => {
      if (promise.status === "fulfilled") {
        const path = promise.value;
        if (!shortestPath || shortestPath.length > path.length) {
          shortestPath = path;
        }
      }
    });
    //console.log("Shortest path found: ", shortestPath);
    return shortestPath;
  }
}

// const pathfinder = new Pathfinder("137");
// pathfinder
//   .getTokenPath({
//     tokenAddress: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
//     destinationAddress: "0x282d8efCe846A88B159800bd4130ad77443Fa1A1",
//     IN: true,
//   })
//   .then((r) => console.log("response", r))
//   .catch(console.error);
