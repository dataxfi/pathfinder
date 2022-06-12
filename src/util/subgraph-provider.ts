import { formatter } from "./request-response-format";
import { otherChainsReq, uniswapSchemaReq } from "./subgraph-requests";
import rinkeby from "./rinkeby.json";

/**
 * Returns set of all pools which contain provided address from Energyweb chain (246)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function energywebPools(address: string, amt: string = "0.001") {
  return otherChainsReq("https://ewc-subgraph-production.carbonswap.exchange/subgraphs/name/carbonswap/uniswapv2", address, amt);
}

/**
 * Returns set of all pools which contain provided address from matic chain (137)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */

export async function maticPools(address: string, amt: string = "0.001") {
  return otherChainsReq("https://polygon.furadao.org/subgraphs/name/quickswap", address, amt);
}
/**
 * Returns set of all pools which contain provided address from mainnet (1)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function mainnetPools(address: string, amt: string = "0.001") {
  return uniswapSchemaReq("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3", address, amt);
}

/**
 * Returns set of all pools which contain provided address from bsc chain (56)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function bscPools(address: string, amt: string = "0.001") {
  return otherChainsReq("https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2", address, amt);
}

/**
 * Returns set of all pools which contain provided address from moonriver chain (1285)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function moonriverPools(address: string, amt: string = "0.001") {
  return otherChainsReq("https://api.thegraph.com/subgraphs/name/solarbeamio/amm-v2", address, amt);
}

/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */

export async function rinkebyPools(address: string) {
  const pools = rinkeby[address];
  //TODO: Traverse pools to request and set total locked tokens:
  //TODO: "totalValueLockedToken0": (x)
  //TODO: "totalValueLockedToken1": (x)
  const data = { data: { data: { ...pools } } };

  return formatter(data);
}
