/**
 * Builds and returns query for supported chains other than uniswap
 * @param address
 * @param amt
 * @param first
 * @param skip
 * @returns a query as a string
 */

export function uniswapV2Query(address: string, amt: string, skipT0: number = 0, skipT1: number = 0, callT0: boolean = true, callT1: boolean = true) {
  console.log("Calling with v2 schema (pairs)");
  console.log(address, amt, skipT0, skipT1, callT0, callT1)
  const generalReq = `orderBy:reserveUSD
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
  }`;

  const t0Match = `t0IsMatch: pairs(first:1000 skip:${skipT0} where:{token0_contains:"${address}", reserve0_gt:"${amt}"}
  ${generalReq}`;

  const t1Match = `t1IsMatch: pairs(first:1000 skip:${skipT1} where:{token1_contains:"${address}", reserve1_gt:"${amt}"}
  ${generalReq}`;

  const query = `
  query {
    ${callT0 ? t0Match : ""}

    ${callT1 ? t1Match : ""}
  }
  `;
  console.log(query)
  return query
}

/**
 * Builds and returns uniswap query
 * @param address
 * @param amt
 * @param first
 * @param skip
 * @returns a query as a string
 */

export function uniswapV3Query(address: string, amt: string, skipT0: number = 0, skipT1: number = 0, callT0: boolean = true, callT1: boolean = true) {
  console.log("Calling with v3 schema (pools)");

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
      totalValueLockedToken0
      totalValueLockedToken1
    }`;

  const t0Match = `t0IsMatch: pools(first:1000 skip:${skipT0} where:{token0_in:["${address}"],
    totalValueLockedToken0_gt:"${amt}"}     
    ${generalReq}`;

  const t1Match = `t1IsMatch: pools(first:1000 skip:${skipT1} where:{token1_in:["${address}"], 
  totalValueLockedToken1_gt:"${amt}"}   
  ${generalReq}`;

  return `query {
      ${callT0 ? t0Match : ""}
      
      ${callT1 ? t1Match : ""}
    }`;
}
