import { requestResponse } from "../@types";

/**
 * Formats query responses into one standard object.
 * @param response
 * @returns IPoolNode[]
 */
export function formatter(response: any, address: string[]) {
  if (response.data?.errors) return;
  try {
    let {
      data: { data },
    } = response;


    const requestResponse: requestResponse[] = [];

    address.forEach((address) => {
      let t0Match = data[`t0IsMatch${address}`];
      let t1Match = data[`t1IsMatch${address}`];
      if (!t0Match) t0Match = [];
      if (!t1Match) t1Match = [];
      const t0MatchLength = t0Match.length;
      const t1MatchLength = t1Match.length;
      const allMatchedPools = [...t0Match, ...t1Match];

      requestResponse.push({
        t0MatchLength,
        t1MatchLength,
        allMatchedPools
      });
    });

    return requestResponse;
  } catch (error) {
    console.error(error);
  }
}
