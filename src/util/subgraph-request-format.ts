/**
 * Builds and returns query for supported chains other than uniswap
 * @param address
 * @param amt
 * @param first
 * @param skip
 * @returns a query as a string
 */

export function otherChainsQuery(address: string, amt: string, first: number = 1000, skip: number = 0) {
  return `
  query {
    t0IsMatch: pairs(first:${first} skip:${skip} where:{token0_contains:"${address}", reserve0_gt:"${amt}"}
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
    
    t1IsMatch: pairs(first:${first} skip:${skip} where:{token1_contains:"${address}", reserve1_gt:"${amt}"}
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

export function uniswapQuery(address: string, amt: string, first: number = 1000, skip: number = 0) {
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

  return `query {
      t0IsMatch: pools(first:${first} skip:${skip} where:{token0_in:["${address}"],
      totalValueLockedToken0_gt:"${amt}"}     
      ${generalReq}
      
      
      t1IsMatch: pools(first:${first} skip:${skip} where:{token1_in:["${address}"], 
      totalValueLockedToken1_gt:"${amt}"}   
      ${generalReq}
    }`;
}
