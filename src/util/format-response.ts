import { requestResponse } from "../@types";

/**
 * Formats query responses into one standard object.
 * @param response
 * @returns IPoolNode[]
 */
export function formatter(response: any) {
  if (response.data?.errors) return;
  try {
    let {
      data: {
        data: { t0IsMatch, t1IsMatch },
      },
    } = response;

    const t0MatchLength = t0IsMatch?.length;
    const t1MatchLength = t1IsMatch?.length;
    if (!t0IsMatch) t0IsMatch = [];
    if (!t1IsMatch) t1IsMatch = [];
    const allData = [...t0IsMatch, ...t1IsMatch];

    const edges = new Set(allData.map((poolData) => poolData.id));

    const requestResponse: requestResponse = {
      t0MatchLength,
      t1MatchLength,
      allMatchedPools: allData.map((pool) => ({
        poolAddress: pool.id,
        t1Address: pool.token0.id,
        t2Address: pool.token1.id,
        t1Liquidity: pool.totalValueLockedToken0,
        t2Liquidity: pool.totalValueLockedToken1,
        edges,
      })),
    };

    return requestResponse;
  } catch (error) {
    console.error(error);
  }
}
