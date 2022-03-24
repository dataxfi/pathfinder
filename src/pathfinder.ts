// import { IToken } from "@dataxfi/datax.js";
const axios = require("axios");
// import { resolve } from "dns";
// import { supportedChains } from "./types";
// interface IUniswapResponse0 {
//   id: string;
//   token1: {
//     id: string;
//   };
//   volumeToken0: string;
// }

// interface IUniswapResponse1 {
//   id: string;
//   token0: {
//     id: string;
//   };
//   volumeToken1: string;
// }

/**
 * pathfinder for swap transactions
 * @param chainId
 *
 */

// export async function swapPathfinder(chainId: supportedChains, token1: IToken, token2: IToken) {
//   if (!token1.info || !token2.info) return;
//   let tokenInPools: any;
//   let tokenOutPools: any;
//   let path = [token1.info.address];

//   switch (chainId) {
//     case "4":
//       //   token1Pools = await rinkebyPools(token1.info.address);
//       //   token2Pools = await rinkebyPools(token2.info.address);
//       break;
//     case "137":
//       tokenInPools = await maticPools(token1.info.address);
//       tokenOutPools = await maticPools(token2.info.address, token2.value.plus(1).toString());
//     case "56":
//       tokenInPools = await bscPools(token1.info.address, token1.value.plus(1).toString());
//       tokenOutPools = await bscPools(token2.info.address, token2.value.plus(1).toString());
//       break;
//     case "246":
//       //   token1Pools = await energyWebPools(token1.info.address);
//       //   token2Pools = await energyWebPools(token2.info.address);
//       break;
//     case "1285":
//       tokenInPools = await moonriverPools(token1.info.address, token1.value.plus(1).toString());
//       tokenOutPools = await moonriverPools(token2.info.address, token2.value.plus(1).toString());
//       break;
//     default:
//       //default mainnet
//       tokenInPools = await mainnetPools(token1.info.address, token1.value.plus(1).toString());
//       tokenOutPools = await mainnetPools(token2.info.address, token2.value.plus(1).toString());
//       break;
//   }
// }

interface IPoolNode {
  poolAddress: string;
  t1Address: string;
  t2Address: string;
  t1Liquidity: string;
  t2Liquidity: string;
  edges: string[];
}

export class Pathfinder {
  private fetchFunction;
  private IN;
  private amt;
  private nodes: { [key: string]: IPoolNode };
  private tokenIn: string;
  private tokenOut: string;
  private leaves: IPoolNode[];
  private tokensChecked: Set<string>;
  // public path;

  constructor({ fetchFunction, IN, amt, tokenIn, tokenOut }: { fetchFunction: Function; IN: boolean; amt?: string; tokenIn: string; tokenOut: string }) {
    this.fetchFunction = fetchFunction;
    this.IN = IN;
    this.amt = amt;
    this.nodes = {};
    this.leaves = [];
    this.tokenIn = tokenIn;
    this.tokenOut = tokenOut;
    this.tokensChecked = new Set();

    // this.path = IN ? this.buildPoolGraph({ tokenAddress: tokenIn }) : this.buildPoolGraph({ tokenAddress: tokenOut.info?.address, amt });
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
    parentPoolAddress,
    amt,
    signal,
  }: {
    tokenAddress: string;
    parentPoolAddress?: string;
    amt?: string;
    signal?: AbortSignal;
  }): Promise<any[][] | null> {
    const nextTokensToSearch: any = [];
    return new Promise(async (resolve, reject) => {
      if (this.tokensChecked.has(tokenAddress)) resolve(null);
      signal?.addEventListener("abort", () => {
        reject(new Error("Aborted"));
      });

      try {
        if (this.IN) {
          this.leaves = await this.fetchFunction(tokenAddress);
        } else {
          this.leaves = await this.fetchFunction(tokenAddress, amt);
        }

        //iterate pools response adding nodes and edges
        for (let i = 0; i < this.leaves.length; i++) {
          const poolNode = this.leaves[i];
          if ((this.IN && poolNode.poolAddress === this.tokenOut) || (!this.IN && poolNode.poolAddress === this.tokenIn)) {
            //check if destination pool was found, return null to signify there is no need to search further
            resolve(null);
          }

          const nextTokenAddress = poolNode.t1Address === tokenAddress ? poolNode.t2Address : poolNode.t1Address;

          //since the destination pool was not found, the token needs to be swapped as path descends
          //calculate what amount of the next token would be needed from the next pool
          let nextAmt;
          if (!this.IN) nextAmt = "1"; //calculateSwap()
          this.IN ? nextTokensToSearch.push([nextTokenAddress, poolNode.poolAddress]) : nextTokensToSearch.push([nextTokenAddress, poolNode.poolAddress, nextAmt]);
          //add node to tree
          if (this.IN) {
            let hasEnoughLiquidity;
            //todo: calculateSwap and check if there is enough liquidity
            // if (!hasEnoughLiquidity) break;
          }
          this.addPoolNode(poolNode);

          this.tokensChecked.add(tokenAddress);
          if (parentPoolAddress) {
            //add edge to parent
            this.nodes[parentPoolAddress].edges.push(poolNode.poolAddress);
            //add edge from parent to new node
            this.nodes[poolNode.poolAddress].edges.push(parentPoolAddress);
          }
        }

        resolve(nextTokensToSearch);
      } catch (error) {
        reject(error);
      }
    });
  }

  public async buildPoolGraph({ tokenAddress, parentPoolAddress, amt, signal }: { tokenAddress: string; parentPoolAddress?: string; amt?: string; signal?: AbortSignal }) {
    let nextTokensToSearch;

    return new Promise(async (resolve, reject) => {
      signal?.addEventListener("abort", () => {
        reject(new Error("Aborted"));
      });
      console.log("Nodes:", this.nodes);
      try {
        if (this.tokensChecked.size === 0) {
          if (this.IN) {
            nextTokensToSearch = await this.getPoolsForToken({
              tokenAddress,
            });
          } else {
            nextTokensToSearch = await this.getPoolsForToken({
              tokenAddress,
              amt,
            });
          }
        } else {
          if (this.IN) {
            nextTokensToSearch = await this.getPoolsForToken({
              tokenAddress,
              parentPoolAddress,
            });
          } else {
            nextTokensToSearch = await this.getPoolsForToken({
              tokenAddress,
              parentPoolAddress,
              amt,
            });
          }
        }

        if (!nextTokensToSearch) {
          resolve(""); //BFSPath
        } else {
          nextTokensToSearch.forEach((token) => {
            if (this.IN) {
              this.buildPoolGraph({ tokenAddress: token[0], parentPoolAddress: token[1], amt: token[2] });
            } else {
              this.buildPoolGraph({ tokenAddress: token[0], parentPoolAddress: token[1], amt: token[2] });
            }
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private BFSPath(graph: {}, tokenInAddress: string, tokenOutAddress: string) {}
}

const OCEANUSDC = new Pathfinder({
  IN: true,
  fetchFunction: mainnetPools,
  tokenIn: "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
  tokenOut: "0x6b175474e89094c44da98b954eedeac495271d0f",
});
console.log(OCEANUSDC);
OCEANUSDC.buildPoolGraph({ tokenAddress: "0x967da4048cd07ab37855c090aaf366e4ce1b9f48" });

function formatter({
  address,
  t1Address,
  t2Address,
  t1Liquidity,
  t2Liquidity,
}: {
  address: string;
  t1Address: string;
  t2Address: string;
  t1Liquidity: string;
  t2Liquidity: string;
}) {
  return { address, t1Address, t2Address, t1Liquidity, t2Liquidity, edges: [] };
}

/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */

async function rinkebyPools(address: string) {}
/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
async function energyWebPools(address: string) {}

function uniswapQuery(address: string, amt: string) {
  `query {
    t0isOcean: pools(where:{token0_contains:"${address}", volumeToken0_gt:"${amt}"} ){
    id
    token1{
      id
    }
    token0{
      id
    }
    totalValueLockedToken0
    totalValueLockedToken1
  }
  t1isOcean: pools(where:{token1_contains:"${address}", volumeToken1_gt:"${amt}"} ){
    id
    token0{
      id
    }
    token1{
      id
    }
    totalValueLockedToken0
    totalValueLockedToken1
  }
}`;
}

async function uniswapSchemaReq(url: string, address: string, amt?: string) {
  if (!amt) amt = "-1";
  const uniswap = await axios.post(url, {
    query: uniswapQuery(address, amt),
  });

  const {
    data: { t0isOcean, t1isOcean },
  } = uniswap;

  const allData = [...t0isOcean, ...t1isOcean];
  return allData.map((pool) =>
    formatter({ address: pool.id, t1Address: pool.token0.id, t2Address: pool.token1.id, t1Liquidity: pool.totalValueLockedToken0, t2Liquidity: pool.totalValueLockedToken1 })
  );
}

/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */

async function maticPools(address: string, amt?: string) {
  return uniswapSchemaReq("https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon", address, amt);
}
/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
async function mainnetPools(address: string, amt: string) {
  return uniswapSchemaReq("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3", address, amt);
}
/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
async function bscPools(address: string, amt: string) {
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
async function moonriverPools(address: string, amt: string) {
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

//matic balancer
//   const balancer = await axios.post("https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2", {
//     query: `query{
//         pools (where:{tokensList_contains:["${address}"]}){
//           tokens{
//             address
//             balance
//           }
//         }
//       }`,
//   });

//   const poolsWEnoughLiquidity = balancer.data.pools
//     .filter((pool: { tokens: any[] }) => pool.tokens.find((token) => token.address === address && Number(token.balance) > Number(amt)))
//     .map((pool: any) =>
//       formatter(
//         pool.address,
//         pool.tokens.find((token:any) => token.address === address)
//       )
//     );

// const formattedUniswapPools = uniswap.map((pool)=>{formatter<...>})

//mainnet balancer
// const balancer = axios.post("https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2", {
//   query: `query{
//       pools (where:{tokensList_contains:["${address}"]}){
//           address
//         tokens{
//           address
//           balance
//         }
//       }
//     }`,
// });
