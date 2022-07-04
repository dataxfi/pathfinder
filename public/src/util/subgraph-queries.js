"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniswapV3Query = exports.uniswapV2Query = void 0;
var v2ReqFields = "orderBy:reserveUSD\n  orderDirection:desc){\n      id\n    token1{\n      id\n    }\n    token0{\n      id\n    }\n\n    totalValueLockedToken0:reserve0\n    totalValueLockedToken1:reserve1\n  }";
function v2GeneralReq(address, callT0, callT1) {
    var t0Match = "t0IsMatch".concat(address, ": pairs(first:1000 skip:0 where:{token0_contains:\"").concat(address, "\", volumeUSD_gt:\"100\"}\n  ").concat(v2ReqFields);
    var t1Match = "t1IsMatch".concat(address, ": pairs(first:1000 skip:0 where:{token1_contains:\"").concat(address, "\", volumeUSD_gt:\"100\"}\n  ").concat(v2ReqFields);
    return "\n  ".concat(callT0 ? t0Match : "", "\n  ").concat(callT1 ? t1Match : "", "\n  ");
}
function splitQueryList(addresses) {
    var finalAddresses = [];
    var oddAddress;
    //for lists with an odd length, pop one address
    if (addresses.length % 2 !== 0) {
        oddAddress = addresses.pop();
    }
    //split the queries in half
    var splitAmt = addresses.length / 2;
    var currentSet = [];
    //go through all addresses and create arrays of equal length
    addresses.forEach(function (address, index) {
        if (index && (currentSet.length % 20 === 0 || currentSet.length % splitAmt === 0)) {
            finalAddresses.push(currentSet);
            currentSet = [address];
        }
        else {
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
function buildQueries(version, addresses, callT0, callT1) {
    var queryFunction = version === 2 ? v2GeneralReq : function () { };
    return addresses.map(function (addressOrSet) {
        if (Array.isArray(addressOrSet)) {
            return addressOrSet.map(function (address) { return queryFunction(address, callT0[0], callT1[0]); });
        }
        else {
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
function uniswapV2Query(addresses, split, skipT0, skipT1, callT0, callT1) {
    // ${skipT0[index]}${skipT1[index]}
    if (skipT0 === void 0) { skipT0 = [0]; }
    if (skipT1 === void 0) { skipT1 = [0]; }
    if (callT0 === void 0) { callT0 = [true]; }
    if (callT1 === void 0) { callT1 = [true]; }
    var listToUse = split && addresses.length > 1 ? splitQueryList(addresses) : addresses;
    var queries = buildQueries(2, listToUse, callT0, callT1);
    if (Array.isArray(queries[0])) {
        return queries.map(function (querySet) { return "query {\n      ".concat(querySet.join("\n"), "\n    }"); });
    }
    else {
        return "\n      query {\n        ".concat(queries.join("\n"), "\n      }");
    }
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