import axios from "axios";
import { formatter } from "./request-response-format";
import { otherChainsQuery, uniswapQuery } from "./subgraph-request-composer";

/**
 * Returns an axios response from the url provided.
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function otherChainsReq(url: string, address: string, amt: string) {
  try {
    const response = await axios.post(
      url,
      {
        query: otherChainsQuery(address, amt),
      },
      { timeout: 600000 }
    );

    return formatter(response);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Returns an axios response from the url provided.
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function uniswapSchemaReq(url: string, address: string, amt: string) {
  try {
    const uniswap = await axios.post(
      url,
      {
        query: uniswapQuery(address, amt),
      },
      { timeout: 600000 }
    );

    return formatter(uniswap);
  } catch (error) {
    console.error(error);
  }
}
