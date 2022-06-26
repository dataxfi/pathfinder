import { Trade } from "@dataxfi/datax.js";
import Web3 from "web3";
import { INextTokensToSearch, IPoolGraph, IPoolNode, ITokenGraph, queryFunction, queryParams, supportedChains } from "./@types";
import { bscPools, energywebPools, mainnetPools, maticPools, moonriverPools, rinkebyPools } from "./util";
// import fs from "fs";
export default class Pathfinder {
  private fetchFunction: queryFunction;
  public nodes: ITokenGraph;
  public tokensChecked: Set<string>;
  private pendingQueries: Set<string>;
  private userTokenIn: string;
  private userTokenOut: string;
  private chainId;
  private allPaths: string[][] = [];
  private trade: Trade;
  private depth: number = 0;
  private pathFound: boolean = false;

  constructor(chainId: supportedChains, web3?: Web3) {
    this.nodes = {};
    this.tokensChecked = new Set();
    this.pendingQueries = new Set();
    this.userTokenIn = "";
    this.userTokenOut = "";
    this.chainId = chainId;
    // this.trade = new Trade(web3, chainId);

    switch (Number(this.chainId)) {
      case 4:
        this.fetchFunction = rinkebyPools;
        break;
      case 137:
        this.fetchFunction = maticPools;
        break;
      case 56:
        this.fetchFunction = bscPools;
        break;
      case 1285:
        this.fetchFunction = moonriverPools;
        break;
      case 246:
        this.fetchFunction = energywebPools;
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
    tokenNode[poolNode.poolAddress] = poolNode;
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
    parentTokenAddress,
    IN,
    nextTokensToSearch,
    amt,
  }: {
    poolsFromToken: IPoolNode[];
    tokenAddress: string;
    destinationAddress: string;
    parentTokenAddress: string;
    IN: boolean;
    nextTokensToSearch: INextTokensToSearch;
    amt?: string;
  }): Promise<INextTokensToSearch | null> {
    //console.log("searchPoolData was called with (nextTokensToSearch): ");
    // console.dir(nextTokensToSearch);
    return new Promise(async (resolve, reject) => {
      //console.log("Inside pool search function.");
      try {
        if (poolsFromToken.length === 0) {
          console.error("There are no pools for " + tokenAddress + " on this chain.");
          reject({ code: 1, message: "There are no pools for " + tokenAddress + " on this chain." });
        }
        //iterate pools response adding nodes and edges
        for (let i = 0; i < poolsFromToken.length; i++) {
          const poolNode = poolsFromToken[i];

          let t1IsIn = poolNode.t1Address === tokenAddress;
          if (this.nodes[tokenAddress]) {
            this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
          } else {
            this.addTokenNode(tokenAddress, parentTokenAddress);
            this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
          }

          const nextTokenAddress = poolNode.t1Address === tokenAddress ? poolNode.t2Address : poolNode.t1Address;
          //if exact token is token out, calculate what amount of the next token would be needed from the next pool
          let nextAmt;
          if (!IN) nextAmt = "1"; //await this.trade.getAmountsIn(amt, [parentTokenAddress, nextTokenAddress]);
          if (!nextTokensToSearch[nextTokenAddress])
            IN ? (nextTokensToSearch[nextTokenAddress] = { parent: tokenAddress }) : (nextTokensToSearch[nextTokenAddress] = { parent: tokenAddress, amt: nextAmt[0] });

          // //if exact token is token in, check if there is enough liquidity to support this swap
          // if (IN) {
          //   const amountOut = await this.trade.getAmountsOut(amt, [parentTokenAddress, nextTokenAddress]);
          //   const liquidityNeeded = t1IsIn ? poolNode.t2Liquidity : poolNode.t1Liquidity;
          //   if (amountOut[0] > liquidityNeeded) {
          //     resolve(null);
          //     return;
          //   }
          // }

          //This will resolve if the destination is found, regardless of whether there might be another
          // pool with less fees or more liquidity. The path will be the same even if there is another pool at the current
          // search depth, so fees and liquidity are currently being ignored.
          if (poolNode.t1Address.toLowerCase() === this.userTokenOut.toLowerCase() || poolNode.t2Address.toLowerCase() === this.userTokenOut.toLowerCase()) {
            //console.log("Match found, resolving null.");
            this.addTokenNode(destinationAddress, tokenAddress);
            this.pathFound = true;
            resolve(null);
            return;
          }
        }

        //console.log("No match found, resolving next tokens to search:", nextTokensToSearch);
        resolve(nextTokensToSearch);
      } catch (error) {
        console.error(error);
      }
    });
  }

  /**
   * Recursively calls subgraphs for all relevant pool data for a token.
   * @param tokenAddress The token to get pools for (token in)
   * @param destinationAddress The token to be attained (token out)
   * @param amt The amount of destination token desired
   * @param IN Wether the exact token is the token in
   * @param parentTokenAddress the token that was traded prior to the current token being searched (for recursion)
   * @param queryParams pagination for pool data requests (for recursion)
   * @param poolsFromToken all pool data from token (for recursion)
   * @param nextTokensToSearch all tokens to search next (for recursion)
   * @returns next tokens to search
   */
  private async getPoolData({
    tokenAddress,
    destinationAddress,
    amt,
    IN,
    parentTokenAddress,
    queryParams = { skipT0: 0, skipT1: 0, callT0: true, callT1: true },
    poolsFromToken = [],
    nextTokensToSearch = {},
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    amt?: string;
    parentTokenAddress?: string;
    skip?: number;
    poolsFromToken?: IPoolNode[];
    nextTokensToSearch?: INextTokensToSearch;
    queryParams?: queryParams;
  }): Promise<INextTokensToSearch> {
    if (this.pathFound) {
      //console.log("Path already found, returning.");
      return null;
    }

    try {
      tokenAddress = tokenAddress.toLowerCase();
      destinationAddress = destinationAddress.toLowerCase();
      let { skipT0, skipT1, callT0, callT1 } = queryParams;
      // skip tokens already searched
      if (this.tokensChecked.has(tokenAddress)) {
        //console.log("Skipping previously checked token");
        return;
      }
      this.pendingQueries.add(tokenAddress);

      //console.log(skipT0, skipT1, callT0, callT1);
      // fetch results (2000 max default)
      // await new Promise(() => {
      //   setTimeout(() => {}, 25);
      // });
      const response = await this.fetchFunction(tokenAddress, amt, skipT0, skipT1, callT0, callT1);
      let t0MatchLength: number = 0,
        t1MatchLength: number = 0,
        allMatchedPools: IPoolNode[] = [];

      if (response.t0MatchLength) t0MatchLength = response.t0MatchLength;
      if (response.t1MatchLength) t1MatchLength = response.t1MatchLength;
      if (response.allMatchedPools) allMatchedPools = response.allMatchedPools;

      if (!allMatchedPools) {
        throw new Error("Failed to retrieve subgraph data.");
      }
      //console.log("all matched pools", allMatchedPools);
      poolsFromToken.push(...allMatchedPools);

      //console.log("Calling searchPoolData");
      // search results for destination
      nextTokensToSearch = await this.searchPoolData({
        poolsFromToken,
        tokenAddress,
        destinationAddress,
        IN,
        parentTokenAddress,
        amt,
        nextTokensToSearch,
      });

      //console.log("Pool data search complete");
      // recurse if results were >= 1000
      if ((nextTokensToSearch && t0MatchLength === 1000) || t1MatchLength === 1000) {
        //console.log("Getting more data");
        //console.log(t0MatchLength, t1MatchLength);
        if (t0MatchLength === 1000) {
          skipT0 += 1000;
          callT0 = true;
        } else {
          callT0 = false;
        }

        if (t1MatchLength === 1000) {
          skipT1 += 1000;
          callT1 = true;
        } else {
          callT1 = false;
        }

        const newQueryParams: queryParams = {
          skipT0,
          skipT1,
          callT0,
          callT1,
        };

        //console.log("New query params:", newQueryParams);

        return await this.getPoolData({
          tokenAddress,
          destinationAddress,
          parentTokenAddress,
          amt,
          IN,
          poolsFromToken,
          nextTokensToSearch,
          queryParams: newQueryParams,
        });
      }

      this.pendingQueries.delete(tokenAddress);
      this.tokensChecked.add(tokenAddress);
      //console.log("No more pools to search at this depth, returning next tokens to search.");
      // if there are no more results to be searched, return nextTokensToSearch
      return nextTokensToSearch;
    } catch (error) {
      console.error("An error occured:", error);
    }
  }

  /**
   * Gets token paths for a swap pair. Recursively calls itself until userTokenOut is found.
   * @param param0
   * @returns An array of tokens to be traded in order to route to the destination token in the shortest path possible.
   */
  private async getTokenPaths({
    tokenAddress,
    destinationAddress,
    IN,
    parentTokenAddress,
    amt,
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    parentTokenAddress?: string;
    amt?: string;
  }): Promise<void> {
    try {
      //console.log("Pending queries", this.pendingQueries.size);
      const nextTokensToSearch = await this.getPoolData({ tokenAddress, destinationAddress, parentTokenAddress, amt, IN });

      //console.log("NextTokensToSearch", nextTokensToSearch);
      if (nextTokensToSearch && Object.keys(nextTokensToSearch).length > 0) {
        for (let [token, value] of Object.entries(nextTokensToSearch)) {
          //console.log("Iterating through next tokens to search");
          await this.getTokenPaths({ destinationAddress, tokenAddress: token, parentTokenAddress: value.parent, amt: value.amt, IN });
        }
      } else if (this.pendingQueries.size === 0) {
        //console.log("pending query size is : ", this.pendingQueries.size, "calling construct path with", this.userTokenOut);
        // fs.writeFileSync("data.json", JSON.stringify(this.nodes));
        const path = this.constructPath({ destination: this.userTokenOut });
        if (path) {
          this.allPaths.push(path);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Get best token path for swap pair. Awaits all results from getTokenPaths then
   * returns the shortest path.
   * @param param0
   * @returns
   */
  public async getTokenPath({
    tokenAddress,
    destinationAddress,
    amt,
    abortSignal,
    IN,
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    parentTokenAddress?: string;
    amt?: string;
    abortSignal?: AbortSignal;
  }): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      abortSignal?.addEventListener("abort", () => {
        return reject(new Error("Aborted"));
      });

      this.depth = 0;
      this.nodes = {}
      this.pathFound = false
      this.allPaths = []
      this.tokensChecked = new Set()

      tokenAddress = tokenAddress.toLowerCase();
      destinationAddress = destinationAddress.toLowerCase();

      if (!this.userTokenIn) this.userTokenIn = tokenAddress;
      if (!this.userTokenOut) this.userTokenOut = destinationAddress;

      if (tokenAddress === destinationAddress) {
        return resolve([tokenAddress]);
      }

      //console.log("Calling get token paths");
      await this.getTokenPaths({ tokenAddress, destinationAddress, amt, IN });
      if (this.pendingQueries.size === 0) {
        //console.log("Resolving because there are no more pending queries");
        const path = await this.resolveAllPaths();
        return resolve(path);
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
    const allPathsResolved = await Promise.allSettled(this.allPaths);
    allPathsResolved.forEach(async (promise) => {
      if (promise.status === "fulfilled") {
        const path = promise.value;
        if (!shortestPath || shortestPath.length > path.length) {
          shortestPath = path;
        }
      }
    });
    console.log("Shortest path found: ", shortestPath);
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
