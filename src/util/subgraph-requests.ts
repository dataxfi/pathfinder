import axios from "axios";
import { requestResponse } from "../@types";
import { formatter } from "./format-response";
import { uniswapV2Query, uniswapV3Query } from "./subgraph-queries";

/**
 * Returns an axios response from the url provided.
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function uniswapV2Req(url: string, split: boolean, addresses: string[], skipT0: number[], skipT1: number[], callT0: boolean[], callT1: boolean[]): Promise<[requestResponse[], number]> {
  const request = (query) =>
    axios.post(
      url,
      {
        query,
      },
      { timeout: 600000 }
    );

  let allData = {};
  const checkFailed = (response) => {
    if (response.data?.errors) throw new Error("Failed to call subgraph");
  };
  let apiRequestCount = 0;

  const queries = uniswapV2Query(addresses, split, skipT0, skipT1, callT0, callT1);
  if (split && Array.isArray(queries)) {
    for (const query of queries) {
      apiRequestCount++;
      const response = await request(query);
      checkFailed(response);
      allData = { ...allData, ...response.data.data };
      console.log("Response received.")
    }
  } else {
    apiRequestCount++;
    const response = await request(queries);
    checkFailed(response);
    allData = response.data.data;
  }

  return [formatter(allData, addresses), apiRequestCount];
}

/**
 * Returns an axios response from the url provided.
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
// export async function uniswapV3Req(url: string, address: string[], skipT0: number[], skipT1: number[], callT0: boolean[], callT1: boolean[]) {
//   try {
//     const uniswap = await axios.post(
//       url,
//       {
//         query: uniswapV3Query(address, skipT0, skipT1, callT0, callT1),
//       },
//       { timeout: 600000 }
//     );
//     // console.info("Response for token" + address + ":" + uniswap);
//     return formatter(uniswap);
//   } catch (error) {
//     console.error(error);
//   }
// }
