const axios = require("axios");
interface IPoolNode {
  poolAddress: string;
  t1Address: string;
  t2Address: string;
  t1Liquidity: string;
  t2Liquidity: string;
  edges: Set<string>;
}
interface INextTokensToSearch {
  [key: number]: { parent: string; amt?: number };
}

interface PoolGraph {
  [key: string]: IPoolNode;
}

interface IBFSResultPoolNode {
  pool: IPoolNode;
  parent: string;
}
interface IBFSResults {
  [key: string]: IBFSResultPoolNode;
}

type supportedChains = 1 | "1" | 4 | "4" | 56 | "56" | 137 | "137" | 246 | "246" | 1285 | "1285";

export default class Pathfinder {
  private fetchFunction;
  private nodes: PoolGraph;
  private tokensChecked: Set<string>;
  private pendingQueries: Set<string>;
  private rootPools: string[];
  private userTokenIn: string;
  private userTokenOut: string;
  private chainId;
  // public path;

  constructor(chainId: supportedChains) {
    this.nodes = {};
    this.tokensChecked = new Set();
    this.pendingQueries = new Set();
    this.rootPools = [];
    this.userTokenIn = "";
    this.userTokenOut = "";
    this.chainId = chainId;

    switch (Number(this.chainId)) {
      case 4:
        this.fetchFunction = this.rinkebyPools;
        break;
      case 137:
        this.fetchFunction = this.maticPools;
        break;
      case 56:
        this.fetchFunction = this.bscPools;
        break;
      case 246:
        this.fetchFunction = this.moonriverPools;
        break;
      case 1285:
        this.fetchFunction = this.energyWebPools;
        break;
      default:
        this.fetchFunction = this.mainnetPools;
        break;
    }
  }

  private addPoolNode(poolNode: IPoolNode) {
    this.nodes[poolNode.poolAddress] = poolNode;
  }

  /**
   * Makes request for pools associated to a token, sets nodes on the graph for each pool.
   * @param param0
   * @returns The next tokens to be searched OR null if a path can be made.
   */
  public async getPoolsForToken({
    tokenAddress,
    destinationAddress,
    parentPoolAddress,
    IN,
    amt,
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    parentPoolAddress: string;
    amt?: string;
  }): Promise<INextTokensToSearch | null> {
    const nextTokensToSearch: {} = {};

    return new Promise(async (resolve, reject) => {
      if (this.tokensChecked.has(tokenAddress)) resolve(null);
      let leaves;
      try {
        if (IN) {
          leaves = await this.fetchFunction(tokenAddress);
        } else {
          leaves = await this.fetchFunction(tokenAddress, amt);
        }

        //iterate pools response adding nodes and edges
        for (let i = 0; i < leaves.length; i++) {
          const poolNode = leaves[i];
          if (poolNode.t1Address === destinationAddress || poolNode.t2Address === destinationAddress) {
            //check if destination pool was found, return null to move on to finding path
            resolve(null);
          }

          const nextTokenAddress = poolNode.t1Address === tokenAddress ? poolNode.t2Address : poolNode.t1Address;

          //since the destination pool was not found, the token needs to be swapped as path descends
          //calculate what amount of the next token would be needed from the next pool
          let nextAmt;
          if (!IN) nextAmt = "1"; //calculateSwap()
          if (!nextTokensToSearch[nextTokenAddress])
            IN
              ? (nextTokensToSearch[nextTokenAddress] = { parent: poolNode.poolAddress })
              : (nextTokensToSearch[nextTokenAddress] = { parent: poolNode.poolAddress, amt: nextAmt });

          //add node to tree
          if (IN) {
            let hasEnoughLiquidity;
            //todo: calculateSwap and check if there is enough liquidity
            // if (!hasEnoughLiquidity) break;
          }

          this.addPoolNode(poolNode);

          if (parentPoolAddress) {
            //add edge to parent
            this.nodes[parentPoolAddress].edges.add(poolNode.poolAddress);
            //add edge from parent to new node
            this.nodes[poolNode.poolAddress].edges.add(parentPoolAddress);
          } else {
            this.rootPools.push(poolNode.poolAddress);
          }
        }

        this.tokensChecked.add(tokenAddress);
        resolve(nextTokensToSearch);
      } catch (error) {
        console.error(error);
      }
    });
  }

  private async getNextTokensToSearch({
    tokenInAddress,
    tokenOutAddress,
    parentPoolAddress,
    amt,
    IN,
  }: {
    tokenInAddress: string;
    tokenOutAddress: string;
    IN: boolean;
    parentPoolAddress?: string;
    amt?: string;
  }): Promise<INextTokensToSearch> {
    let nextTokensToSearch: INextTokensToSearch | null;

    try {
      if (IN) {
        // call with recursive values for in
        if (this.pendingQueries.has(tokenInAddress)) return;
        this.pendingQueries.add(tokenInAddress);
        nextTokensToSearch = await this.getPoolsForToken({
          tokenAddress: tokenInAddress,
          destinationAddress: tokenOutAddress,
          IN,
          parentPoolAddress,
        });
        this.pendingQueries.delete(tokenInAddress);
      } else {
        //call with recursive values for out
        if (this.pendingQueries.has(tokenOutAddress)) return;
        this.pendingQueries.add(tokenOutAddress);
        nextTokensToSearch = await this.getPoolsForToken({
          tokenAddress: tokenOutAddress,
          destinationAddress: tokenInAddress,
          IN,
          parentPoolAddress,
          amt,
        });
        this.pendingQueries.delete(tokenOutAddress);
      }
      return nextTokensToSearch;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Gets token path for a swap pair.
   * @param param0 
   * @returns An array of tokens to be traded in order to route to the destination token, optimised to be the shortes path possible.
   */
  public async getTokenPath({
    tokenInAddress,
    tokenOutAddress,
    parentPoolAddress,
    amt,
    abortSignal,
    IN,
  }: {
    tokenInAddress: string;
    tokenOutAddress: string;
    IN: boolean;
    parentPoolAddress?: string;
    amt?: string;
    abortSignal?: AbortSignal;
  }): Promise<string[]> {
    if (!this.userTokenIn) this.userTokenIn = tokenInAddress;
    if (!this.userTokenOut) this.userTokenOut = tokenOutAddress;

    return new Promise(async (resolve, reject) => {
      abortSignal?.addEventListener("abort", () => {
        reject(new Error("Aborted"));
      });

      try {
        const nextTokensToSearch = await this.getNextTokensToSearch({ tokenInAddress, tokenOutAddress, parentPoolAddress, amt, IN });
        if (nextTokensToSearch) {
          for (let [token, value] of Object.entries(nextTokensToSearch)) {
            resolve(this.getTokenPath({ tokenOutAddress, tokenInAddress: token, parentPoolAddress: value.parent, amt: value.amt, IN }));
          }
        }

        if (this.pendingQueries.size === 0) {
          const results: IBFSResults[] = this.breadthSearchGraph(tokenOutAddress);
          const path:string[] = this.constructPath(results, this.userTokenIn, this.userTokenOut);
          resolve(path);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private breadthSearchGraph(destination: string): IBFSResults[] {
    const searches: IBFSResults[] = this.rootPools.map((poolAddress) => {
      let queue = [poolAddress];
      const visitedNodes = {};
      visitedNodes[poolAddress] = null;
      while (queue.length > 0) {
        const currentPoolAddress = queue.shift();
        const pool = this.nodes[currentPoolAddress];
        pool.edges.forEach((poolAddress) => {
          if (!visitedNodes[poolAddress]) {
            visitedNodes[poolAddress] = { pool: this.nodes[poolAddress], parent: currentPoolAddress };
            queue.push(poolAddress);
          }
        });
        if (pool.t1Address === destination || pool.t2Address === destination) {
          return visitedNodes;
        }
      }
    });

    return searches;
  }

  private constructPath(results: IBFSResults[], start: string, destination: string) {
    let allResults: IBFSResults;
    results.forEach((obj: {}) => {
      allResults = { ...allResults, ...obj };
    });
    let matches: IBFSResults = {};
    let bestPath = [];

    function getNextToken(parent: IBFSResultPoolNode, currentPool: IBFSResultPoolNode, currPath, lastToken) {
      currPath.unshift(lastToken);
      if (parent.pool.t1Address === lastToken) {
        lastToken = parent.pool.t2Address;
      } else {
        lastToken = parent.pool.t1Address;
      }

      if (parent.parent === parent.pool.poolAddress) {
        currPath.unshift(start);
        if (bestPath.length <= currPath.length) bestPath = currPath;
        return;
      }

      getNextToken(allResults[parent.parent], parent, currPath, lastToken);
    }

    for (const [key, value] of Object.entries(allResults)) {
      const path = [];
      if (value.pool.t1Address === destination) {
        path.push(value.pool.t1Address);
        const parent = allResults[value.parent];
        getNextToken(parent, value, path, value.pool.t2Address);
      } else if (value.pool.t2Address === destination) {
        bestPath.push(value.pool.t2Address);
        const parent = allResults[value.parent];
        getNextToken(parent, value, path, value.pool.t1Address);
      }
    }
    return bestPath;
  }

  private formatter({
    poolAddress,
    t1Address,
    t2Address,
    t1Liquidity,
    t2Liquidity,
    edges,
  }: {
    poolAddress: string;
    t1Address: string;
    t2Address: string;
    t1Liquidity: string;
    t2Liquidity: string;
    edges?: Set<string>;
  }) {
    if (!edges) edges = new Set();
    return { poolAddress, t1Address, t2Address, t1Liquidity, t2Liquidity, edges };
  }

  /**
   * Returns set of all pools which contain provided address
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */

  private async rinkebyPools(address: string) {}
  /**
   * Returns set of all pools which contain provided address
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */
  private async energyWebPools(address: string) {}

  private uniswapQuery(address: string, amt: string, first: number = 100, skip: number = 0) {
    const generalReq = `orderBy: totalValueLockedUSD
    orderDirection: desc
    subgraphError: allow
  ){
      id
      token1{
        id
      }
      token0{
        id
      }
    }`;

    return `query {
      t0isOcean: pools(first:${first} skip:${skip} where:{token0_in:["${address}"],
      totalValueLockedToken0_gt:"${amt}"}     
      ${generalReq}
      
      t1isOcean: pools(first:${first} skip:${skip} where:{token1_in:["${address}"], 
      totalValueLockedToken1_gt:"${amt}"}   
      ${generalReq}
    }`;
  }

  private async uniswapSchemaReq(url: string, address: string, amt?: string) {
    if (!amt) amt = "0.001";
    const uniswap = await axios.post(url, {
      query: this.uniswapQuery(address, amt),
    });
    const {
      data: {
        data: { t0isOcean, t1isOcean },
      },
    } = uniswap;
    const allData = [...t0isOcean, ...t1isOcean];
    const edges = new Set(allData.map((poolData) => poolData.id));

    return allData.map((pool) =>
      this.formatter({
        poolAddress: pool.id,
        t1Address: pool.token0.id,
        t2Address: pool.token1.id,
        t1Liquidity: pool.totalValueLockedToken0,
        t2Liquidity: pool.totalValueLockedToken1,
        edges,
      })
    );
  }

  /**
   * Returns set of all pools which contain provided address
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */

  private async maticPools(address: string, amt?: string) {
    return this.uniswapSchemaReq("https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon", address, amt);
  }
  /**
   * Returns set of all pools which contain provided address
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */
  private async mainnetPools(address: string, amt: string) {
    return this.uniswapSchemaReq("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3", address, amt);
  }
  /**
   * Returns set of all pools which contain provided address
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */
  private async bscPools(address: string, amt: string) {
    const pancake = axios.post("https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2", {
      query: `query{
          t0isOcean: pairs(where:{token0_contains:"${address}"}){
            id
            token1{
              symbol
            }
          }
          
          t1isOcean: pairs(where:{token1_contains:"${address}"}){
            id
            token0{
              symbol
            }
          }
        }
        
        `,
    });
  }

  /**
   * Returns set of all pools which contain provided address
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */
  private async moonriverPools(address: string, amt: string) {
    const solarbeam = await axios.post("https://api.thegraph.com/subgraphs/name/solarbeamio/amm-v2", {
      query: `query {
          t0isOcean: pairs(where:{token0_contains:"${address}"}){
            token1{
              name
            }
          }
          
          t1isOcean: pairs(where:{token1_contains:"${address}"}){
            token0{
              name
            }
          }
        }`,
    });
  }
}

