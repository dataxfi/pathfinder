"use strict";
/**
 * Builds and returns query for supported chains other than uniswap
 * @param address
 * @param amt
 * @param first
 * @param skip
 * @returns a query as a string
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniswapV3Query = exports.uniswapV2Query = void 0;
function uniswapV2Query(addresses, skipT0, skipT1, callT0, callT1) {
    if (skipT0 === void 0) { skipT0 = [0]; }
    if (skipT1 === void 0) { skipT1 = [0]; }
    if (callT0 === void 0) { callT0 = [true]; }
    if (callT1 === void 0) { callT1 = [true]; }
    console.log("Calling with v2 schema (pairs)");
    // console.log(address, amt, skipT0, skipT1, callT0, callT1)
    var generalReq = "orderBy:reserveUSD\n  orderDirection:desc){\n      id\n    token1{\n      id\n    }\n    token0{\n      id\n    }\n\n    totalValueLockedToken0:reserve0\n    totalValueLockedToken1:reserve1\n  }";
    var queries = [];
    addresses.forEach(function (address, index) {
        var t0Match = "t0IsMatch".concat(address, ": pairs(first:1000 skip:").concat(skipT0[index], " where:{token0_contains:\"").concat(address, "\", volumeUSD_gt:\"10000\"}\n    ").concat(generalReq);
        var t1Match = "t1IsMatch".concat(address, ": pairs(first:1000 skip:").concat(skipT1[index], " where:{token1_contains:\"").concat(address, "\", volumeUSD_gt:\"10000\"}\n    ").concat(generalReq);
        queries.push("\n    ".concat(callT0[index] ? t0Match : "", "\n    ").concat(callT1[index] ? t1Match : "", "\n    "));
    });
    var query = "\n    query {\n      ".concat(queries.join("\n"), "\n    }\n  ");
    // console.log(query)
    return query;
}
exports.uniswapV2Query = uniswapV2Query;
/**
 * Builds and returns uniswap query
 * @param address
 * @param amt
 * @param first
 * @param skip
 * @returns a query as a string
 */
function uniswapV3Query(addresses, skipT0, skipT1, callT0, callT1) {
    if (skipT0 === void 0) { skipT0 = [0]; }
    if (skipT1 === void 0) { skipT1 = [0]; }
    if (callT0 === void 0) { callT0 = [true]; }
    if (callT1 === void 0) { callT1 = [true]; }
    console.log("Calling with v3 schema (pools)");
    var generalReq = "orderBy: totalValueLockedUSD\n    orderDirection: desc\n    subgraphError: allow\n  ){\n      id\n      token1{\n        id\n      }\n      token0{\n        id\n      }\n      totalValueLockedToken0\n      totalValueLockedToken1\n    }";
    //TODO: Update this use array inputs
    var t0Match = "t0IsMatch: pools(first:1000 skip:".concat(skipT0, " where:{token0_in:[\"").concat(addresses, "\"]}\n  ").concat(generalReq);
    var t1Match = "t1IsMatch: pools(first:1000 skip:".concat(skipT1, " where:{token1_in:[\"").concat(addresses, "\"]}   \n  ").concat(generalReq);
    return "query {\n      ".concat(callT0 ? t0Match : "", "\n      \n      ").concat(callT1 ? t1Match : "", "\n    }");
}
exports.uniswapV3Query = uniswapV3Query;
//# sourceMappingURL=subgraph-queries.js.map