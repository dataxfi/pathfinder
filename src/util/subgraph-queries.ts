/**
 * Builds and returns query for supported chains other than uniswap
 * @param address
 * @param amt
 * @param first
 * @param skip
 * @returns a query as a string
 */

export function uniswapV2Query(addresses: string[], skipT0: number[] = [0], skipT1: number[] = [0], callT0: boolean[] = [true], callT1: boolean[] = [true]) {
  
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

  const queries = [];
// ${skipT0[index]}${skipT1[index]}
  addresses.forEach((address, index) => {
    const t0Match = `t0IsMatch${address}: pairs(first:1000 skip:0 where:{token0_contains:"${address}", volumeUSD_gt:"100"}
    ${generalReq}`;

    const t1Match = `t1IsMatch${address}: pairs(first:1000 skip:0 where:{token1_contains:"${address}", volumeUSD_gt:"100"}
    ${generalReq}`;

    queries.push(`
    ${callT0[0] ? t0Match : ""}
    ${callT1[0] ? t1Match : ""}
    `);
  });

  const query = `
    query {
      ${queries.join("\n")}
    }
  `;
  // console.log(query)
  return query;
}

/**
 * Builds and returns uniswap query
 * @param address
 * @param amt
 * @param first
 * @param skip
 * @returns a query as a string
 */

export function uniswapV3Query(addresses: string[], skipT0: number[] = [0], skipT1: number[] = [0], callT0: boolean[] = [true], callT1: boolean[] = [true]) {
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

    //TODO: Update this use array inputs
  const t0Match = `t0IsMatch: pools(first:1000 skip:${skipT0} where:{token0_in:["${addresses}"]}
  ${generalReq}`;

  const t1Match = `t1IsMatch: pools(first:1000 skip:${skipT1} where:{token1_in:["${addresses}"]}   
  ${generalReq}`;

  return `query {
      ${callT0 ? t0Match : ""}
      
      ${callT1 ? t1Match : ""}
    }`;
}
