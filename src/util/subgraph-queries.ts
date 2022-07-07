const v2ReqFields = `orderBy:reserveUSD
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

function v2GeneralReq(address: string, callT0: boolean, callT1: boolean) {
  const t0Match = `t0IsMatch${address}: pairs(first:1000 skip:0 where:{token0_contains:"${address}", reserveUSD_gt:"100"}
  ${v2ReqFields}`;

  const t1Match = `t1IsMatch${address}: pairs(first:1000 skip:0 where:{token1_contains:"${address}", reserveUSD_gt:"100"}
  ${v2ReqFields}`;

  return `
  ${callT0 ? t0Match : ""}
  ${callT1 ? t1Match : ""}
  `;
}

function splitQueryList(addresses: string[]): string[][] | string[] {
  const finalAddresses = [];
  let oddAddress;

  //for lists with an odd length, pop one address
  if (addresses.length % 2 !== 0) {
    oddAddress = addresses.pop();
  }

  //split the queries in half
  let splitAmt = addresses.length / 2;
  let currentSet = [];

  //go through all addresses and create arrays of equal length
  addresses.forEach((address, index) => {
    if (index && (currentSet.length % 10 === 0 || currentSet.length % splitAmt === 0)) {
      finalAddresses.push(currentSet);
      currentSet = [address];
    } else {
      currentSet.push(address);
    }

    if (index === addresses.length - 1) {
      finalAddresses.push(currentSet);
    }
  });

  //push the odd address to an array containing it alone
  if (oddAddress) {
    finalAddresses.push([oddAddress]);
  }

  return finalAddresses;
}

function buildQueries(version: 3 | 2, addresses: string[][] | string[], callT0: boolean[], callT1: boolean[]) {
  const queryFunction = version === 2 ? v2GeneralReq : () => {};

  return addresses.map((addressOrSet: string | string[]) => {
    if (Array.isArray(addressOrSet)) {
      return addressOrSet.map((address) => queryFunction(address, callT0[0], callT1[0]));
    } else {
      return queryFunction(addressOrSet, callT0[0], callT1[0]);
    }
  });
}
/**
 * Builds and returns query for supported chains other than uniswap
 * @param address
 * @param amt
 * @param first
 * @param skip
 * @returns a query as a string
 */

export function uniswapV2Query(addresses: string[], split: boolean, skipT0: number[] = [0], skipT1: number[] = [0], callT0: boolean[] = [true], callT1: boolean[] = [true]) {
  // ${skipT0[index]}${skipT1[index]}

  const listToUse = split && addresses.length > 1 ? splitQueryList(addresses) : addresses;
  const queries = buildQueries(2, listToUse, callT0, callT1);

  if (Array.isArray(queries[0])) {
    return queries.map(
      (querySet: []) => `query {
      ${querySet.join("\n")}
    }`
    );
  } else {
    return `
      query {
        ${queries.join("\n")}
      }`;
  }
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
