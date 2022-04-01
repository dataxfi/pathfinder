const axios = require("axios");
const rinkeby = require("./rinkeby.json");
interface IPoolNode {
  poolAddress: string;
  t1Address: string;
  t2Address: string;
  t1Liquidity: string;
  t2Liquidity: string;
  edges: Set<string>;
}
interface INextTokensToSearch {
  [key: number]: { parentToken: string; amt?: number };
}

interface IPoolGraph {
  [key: string]: IPoolNode;
}

interface ITokenGraph {
  [key: string]: { parent: string; pools: IPoolGraph };
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
  public nodes: ITokenGraph;
  public tokensChecked: Set<string>;
  private pendingQueries: Set<string>;
  private userTokenIn: string;
  private userTokenOut: string;
  private chainId;
  // public path;

  constructor(chainId: supportedChains) {
    this.nodes = {};
    this.tokensChecked = new Set();
    this.pendingQueries = new Set();
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
      case 1285:
        this.fetchFunction = this.moonriverPools;
        break;
      case 246:
        this.fetchFunction = this.energywebPools;
        break;
      default:
        this.fetchFunction = this.mainnetPools;
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
  public async getPoolsForToken({
    tokenAddress,
    destinationAddress,
    parentTokenAddress,
    IN,
    amt,
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    parentTokenAddress: string;
    amt?: string;
  }): Promise<INextTokensToSearch | null> {
    const nextTokensToSearch: {} = {};

    return new Promise(async (resolve, reject) => {
      if (this.tokensChecked.has(tokenAddress)) resolve(null);
      let poolsFromToken: IPoolNode[];
      try {
        if (IN) {
          poolsFromToken = await this.fetchFunction(tokenAddress);
        } else {
          poolsFromToken = await this.fetchFunction(tokenAddress, amt);
        }

        if (poolsFromToken.length === 0) {
          reject({ code: 1, message: "There are no pools for " + tokenAddress + " on this chain." });
        }
        //iterate pools response adding nodes and edges
        for (let i = 0; i < poolsFromToken.length; i++) {
          const poolNode = poolsFromToken[i];

          if (this.nodes[tokenAddress]) {
            this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
          } else {
            this.addTokenNode(tokenAddress, parentTokenAddress);
            this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
          }

          if (poolNode.t1Address === destinationAddress || poolNode.t2Address === destinationAddress) {
            this.addTokenNode(destinationAddress, tokenAddress);
            resolve(null);
          }

          //since the destination pool was not found, the token needs to be swapped as path descends
          //calculate what amount of the next token would be needed from the next pool
          const nextTokenAddress = poolNode.t1Address === tokenAddress ? poolNode.t2Address : poolNode.t1Address;

          let nextAmt;
          if (!IN) nextAmt = "1"; //calculateSwap()
          if (!nextTokensToSearch[nextTokenAddress])
            IN ? (nextTokensToSearch[nextTokenAddress] = { parent: tokenAddress }) : (nextTokensToSearch[nextTokenAddress] = { parent: tokenAddress, amt: nextAmt });

          //add node to tree
          if (IN) {
            let hasEnoughLiquidity;
            //todo: calculateSwap and check if there is enough liquidity
            // if (!hasEnoughLiquidity) break;
          }
        }

        this.tokensChecked.add(tokenAddress);
        resolve(nextTokensToSearch);
      } catch (error) {
        console.error(error);
      }
    });
  }

  /**
   * Calls get poolsForToken with appropriate params
   * @param param0
   * @returns next tokens to search
   */
  private async getNextTokensToSearch({
    tokenAddress,
    destinationAddress,
    parentTokenAddress,
    amt,
    IN,
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    parentTokenAddress?: string;
    amt?: string;
  }): Promise<INextTokensToSearch> {
    let nextTokensToSearch: INextTokensToSearch | null;
    try {
      // call with recursive values for in
      if (this.pendingQueries.has(tokenAddress)) return;
      this.pendingQueries.add(tokenAddress);
      nextTokensToSearch = await this.getPoolsForToken({
        tokenAddress,
        destinationAddress,
        IN,
        parentTokenAddress,
        amt,
      });
      this.pendingQueries.delete(tokenAddress);

      return nextTokensToSearch;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets token path for a swap pair.
   * @param param0
   * @returns An array of tokens to be traded in order to route to the destination token in the shortest path possible.
   */
  public async getTokenPath({
    tokenAddress,
    destinationAddress,
    parentTokenAddress,
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
    if (!this.userTokenIn) this.userTokenIn = tokenAddress;
    if (!this.userTokenOut) this.userTokenOut = destinationAddress;

    return new Promise(async (resolve, reject) => {
      abortSignal?.addEventListener("abort", () => {
        reject(new Error("Aborted"));
      });

      try {
        const nextTokensToSearch = await this.getNextTokensToSearch({ tokenAddress, destinationAddress, parentTokenAddress, amt, IN });
        if (nextTokensToSearch && Object.keys(nextTokensToSearch).length > 0) {
          for (let [token, value] of Object.entries(nextTokensToSearch)) {
            resolve(this.getTokenPath({ destinationAddress, tokenAddress: token, parentTokenAddress: value.parent, amt: value.amt, IN }));
          }
        }

        if (this.pendingQueries.size === 0) {
          resolve(this.constructPath({ destination: this.userTokenOut }));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Follows data from destination token to token in.
   * @param param0
   * @returns path as a string[]
   */
  private constructPath({ path, destination }: { path?: string[]; destination?: string }) {
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
    this.nodes = {};
    this.tokensChecked = new Set();
    this.userTokenIn = "";
    this.userTokenOut = "";
    return path;
  }

  /**
   * Formats query responses into one standard object.
   * @param response
   * @returns IPoolNode[]
   */
  private formatter(response: any) {
    const {
      data: {
        data: { t0isOcean, t1isOcean },
      },
    } = response;

    const allData = [...t0isOcean, ...t1isOcean];

    const edges = new Set(allData.map((poolData) => poolData.id));

    return allData.map((pool) => ({
      poolAddress: pool.id,
      t1Address: pool.token0.id,
      t2Address: pool.token1.id,
      t1Liquidity: pool.totalValueLockedToken0,
      t2Liquidity: pool.totalValueLockedToken1,
      edges,
    }));
  }

  /**
   * Returns set of all pools which contain provided address
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */

  private async rinkebyPools(address: string) {
    const pools = rinkeby[address]
    //TODO: Traverse pools to request and set total locked tokens:
    //TODO: "totalValueLockedToken0": (x)
    //TODO: "totalValueLockedToken1": (x)
    const data = { data: { data: { ...rinkeby[address] } } }

    return this.formatter(data);
  }

  /**
   * Builds and returns uniswap query
   * @param address
   * @param amt
   * @param first
   * @param skip
   * @returns a query as a string
   */

  private otherChainsQuery(address: string, amt: string, first: number = 100, skip: number = 0) {
    return `
  query {
    t0isOcean: pairs(first:${first} skip:${skip} where:{token0_contains:"${address}", reserve0_gt:"${amt}"}
    orderBy:reserveUSD
    orderDirection:desc){
        id
      token1{
        id
      }
      token0{
        id
      }

      totalValueLockedToken0:reserve0
      totalValueLockedToken1:reserve1
    }
    
    t1isOcean: pairs(first:${first} skip:${skip} where:{token1_contains:"${address}", reserve1_gt:"${amt}"}
    orderBy:reserveUSD
    orderDirection:desc){
        id
      token0{
        id
      } 
      token1 {
        id
      }
      
      totalValueLockedToken0:reserve0
      totalValueLockedToken1:reserve1
    }
  }
  `;
  }

  /**
   * Builds and returns uniswap query
   * @param address
   * @param amt
   * @param first
   * @param skip
   * @returns a query as a string
   */

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

  /**
   * Returns an axios response from the url provided.
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */
  private async otherChainsReq(url: string, address: string, amt: string) {
    const response = await axios.post(
      url,
      {
        query: this.otherChainsQuery(address, amt),
      },
      { timeout: 60000 }
    );

    return this.formatter(response);
  }

  /**
   * Returns an axios response from the url provided.
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */
  private async uniswapSchemaReq(url: string, address: string, amt: string) {
    const uniswap = await axios.post(
      url,
      {
        query: this.uniswapQuery(address, amt),
      },
      { timeout: 60000 }
    );

    return this.formatter(uniswap);
  }

  /**
   * Returns set of all pools which contain provided address from Energyweb chain (246)
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */
  private async energywebPools(address: string, amt: string = "0.001") {
    return this.otherChainsReq("https://ewc-subgraph-production.carbonswap.exchange/subgraphs/name/carbonswap/uniswapv2", address, amt);
  }

  /**
   * Returns set of all pools which contain provided address from matic chain (137)
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */

  private async maticPools(address: string, amt: string = "0.001") {
    return this.otherChainsReq("https://polygon.furadao.org/subgraphs/name/quickswap", address, amt);
  }
  /**
   * Returns set of all pools which contain provided address from mainnet (1)
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */
  private async mainnetPools(address: string, amt: string = "0.001") {
    return this.uniswapSchemaReq("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3", address, amt);
  }

  /**
   * Returns set of all pools which contain provided address from bsc chain (56)
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */
  private async bscPools(address: string, amt: string = "0.001") {
    return this.otherChainsReq("https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2", address, amt);
  }

  /**
   * Returns set of all pools which contain provided address from moonriver chain (1285)
   * @param address
   * @param amt - token amount to be swapped. Pools with less than are excluded
   */
  private async moonriverPools(address: string, amt: string = "0.001") {
    return this.otherChainsReq("https://api.thegraph.com/subgraphs/name/solarbeamio/amm-v2", address, amt);
  }
}

const pathfinder = new Pathfinder(56);
const path = pathfinder
  .getTokenPath({
    tokenAddress: "0xdce07662ca8ebc241316a15b611c89711414dd1a",
    destinationAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    IN: true,
  })
  .then(console.log)
  .catch(console.log);
