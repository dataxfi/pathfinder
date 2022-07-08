"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var util_2 = require("../../api/util");
var bignumber_js_1 = require("bignumber.js");
var fs = require("fs");
bignumber_js_1.default.config({ DECIMAL_PLACES: 50 });
// bscPools, energywebPools, moonriverPools, rinkebyPools ,
// import fs from "fs";
var Pathfinder = /** @class */ (function () {
    function Pathfinder(chainId, maxQueryTime) {
        this.allPaths = [];
        this.depth = 0;
        this.pathFound = false;
        this.totalAPIRequest = 0;
        this.maxQueryTime = 15;
        this.initialQueryParams = { skipT0: [0], skipT1: [0], callT0: [true], callT1: [true] };
        this.split = false;
        this.addOcean = "back";
        this.nodes = {};
        this.tokensChecked = new Set();
        this.userTokenIn = "";
        this.userTokenOut = "";
        this.chainId = chainId;
        this.maxQueryTime = maxQueryTime;
        // this.trade = new Trade(web3, chainId);
        switch (Number(this.chainId)) {
            case 4:
                // this.fetchFunction = rinkebyPools;
                break;
            case 137:
                this.fetchFunction = util_1.maticPools;
                break;
            case 56:
                // this.fetchFunction = bscPools;
                break;
            case 1285:
                // this.fetchFunction = moonriverPools;
                break;
            case 246:
                // this.fetchFunction = energywebPools;
                break;
            default:
                this.fetchFunction = util_1.mainnetPools;
                break;
        }
    }
    /**
     * Adds a pool node to the tokenNodes 'pool' attribute (subgraph).
     * @param poolNode The current poolNode (IPoolNode) from the fetch request iteration.
     * @param tokenNode The tokenNode to add poolNode to its 'pool' attribute.
     */
    Pathfinder.prototype.addPoolNode = function (poolNode, tokenNode) {
        tokenNode[poolNode.id] = poolNode;
    };
    /**
     * Adds a token node to the main graph.
     * @param tokenAdress The address of the token whos pools are being visited.
     * @param parentTokenAddress The IN token preceeding the prospective OUT tokens.
     */
    Pathfinder.prototype.addTokenNode = function (tokenAdress, parentTokenAddress, max) {
        if (!parentTokenAddress)
            parentTokenAddress = null;
        this.nodes[tokenAdress] = { parent: parentTokenAddress, pools: {}, max: max };
    };
    /**
     * Makes request for pools associated to a token, sets nodes on the graph for each pool.
     * @param param0
     * @returns The next tokens to be searched OR null if a path can be made.
     */
    Pathfinder.prototype.searchPoolData = function (_a) {
        var poolsFromToken = _a.poolsFromToken, tokenAddress = _a.tokenAddress, destinationAddress = _a.destinationAddress, parentTokenAddresses = _a.parentTokenAddresses, parentIndex = _a.parentIndex;
        return __awaiter(this, void 0, void 0, function () {
            var nextTokensToSearch, nextParentTokenAddresses, half, i, poolNode, t1Address, t2Address, max, parent_1, nextTokenAddress;
            return __generator(this, function (_b) {
                nextTokensToSearch = [];
                nextParentTokenAddresses = [];
                half = function (x) { return new bignumber_js_1.default(x).div(2).toString(); };
                for (i = 0; i < poolsFromToken.length; i++) {
                    poolNode = poolsFromToken[i];
                    t1Address = poolNode.token0.id;
                    t2Address = poolNode.token1.id;
                    max = t1Address === tokenAddress ? half(poolNode.totalValueLockedToken0) : half(poolNode.totalValueLockedToken1);
                    if (this.nodes[tokenAddress]) {
                        this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
                    }
                    else {
                        parent_1 = parentTokenAddresses ? parentTokenAddresses[parentIndex] : null;
                        this.addTokenNode(tokenAddress, parent_1, max);
                        this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
                    }
                    nextTokenAddress = t1Address === tokenAddress ? t2Address : t1Address;
                    if (!this.tokensChecked.has(nextTokenAddress)) {
                        nextTokensToSearch.push(nextTokenAddress);
                        nextParentTokenAddresses.push(tokenAddress);
                    }
                    // This will resolve if the destination is found, regardless of whether there might be another
                    // pool with less fees or more liquidity. The path will be the same even if there is another pool at the current
                    // search depth, so fees and liquidity are currently being ignored.
                    if (t1Address.toLowerCase() === this.userTokenOut.toLowerCase() || t2Address.toLowerCase() === this.userTokenOut.toLowerCase()) {
                        this.addTokenNode(destinationAddress, tokenAddress, max);
                        this.pathFound = true;
                        return [2 /*return*/, null];
                    }
                }
                return [2 /*return*/, [nextTokensToSearch, nextParentTokenAddresses]];
            });
        });
    };
    /**
     * Recursively calls subgraphs for all relevant pool data for a token.
     * @param tokenAddress The token to get pools for (token in)
     * @param destinationAddress The token to be attained (token out)
     * @param amt The amount of destination token desired
     * @param IN Wether the exact token is the token in
     * @param parentTokenAddresses the token that was traded prior to the current token being searched (for recursion)
     * @param queryParams pagination for pool data requests (for recursion)
     * @param poolsFromToken all pool data from token (for recursion)
     * @param nextTokensToSearch all tokens to search next (for recursion)
     * @returns next tokens to search
     */
    Pathfinder.prototype.getPoolData = function (_a) {
        var tokenAddresses = _a.tokenAddresses, destinationAddress = _a.destinationAddress, parentTokenAddresses = _a.parentTokenAddresses, _b = _a.queryParams, queryParams = _b === void 0 ? this.initialQueryParams : _b, _c = _a.poolsFromToken, poolsFromToken = _c === void 0 ? [] : _c;
        return __awaiter(this, void 0, void 0, function () {
            var thisNextTokensToSearch, thisNextParentTokenAddresses, skipT0, skipT1, callT0, callT1, _d, allTokensResponse, apiRequestCount, i, response, t0MatchLength, t1MatchLength, allMatchedPools, tokenAddress, searchResponse, nextTokensToSearch, nextParentTokenAddresses;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (this.pathFound) {
                            return [2 /*return*/, null];
                        }
                        thisNextTokensToSearch = null;
                        thisNextParentTokenAddresses = null;
                        skipT0 = queryParams.skipT0, skipT1 = queryParams.skipT1, callT0 = queryParams.callT0, callT1 = queryParams.callT1;
                        this.totalAPIRequest++;
                        return [4 /*yield*/, this.fetchFunction(tokenAddresses, this.split, skipT0, skipT1, callT0, callT1)];
                    case 1:
                        _d = _e.sent(), allTokensResponse = _d[0], apiRequestCount = _d[1];
                        this.totalAPIRequest = this.totalAPIRequest + apiRequestCount - 1;
                        i = 0;
                        _e.label = 2;
                    case 2:
                        if (!(i < allTokensResponse.length)) return [3 /*break*/, 5];
                        response = allTokensResponse[i];
                        if (!(response && response.allMatchedPools.length > 0)) return [3 /*break*/, 4];
                        t0MatchLength = response.t0MatchLength, t1MatchLength = response.t1MatchLength, allMatchedPools = response.allMatchedPools;
                        tokenAddress = tokenAddresses[i];
                        if (this.tokensChecked.has(tokenAddress))
                            return [2 /*return*/];
                        if (allMatchedPools.length === 0)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.searchPoolData({
                                poolsFromToken: allMatchedPools,
                                tokenAddress: tokenAddress,
                                destinationAddress: destinationAddress,
                                parentTokenAddresses: parentTokenAddresses,
                                parentIndex: i,
                            })];
                    case 3:
                        searchResponse = _e.sent();
                        if (searchResponse) {
                            nextTokensToSearch = searchResponse[0], nextParentTokenAddresses = searchResponse[1];
                            if (!thisNextParentTokenAddresses && nextTokensToSearch) {
                                thisNextParentTokenAddresses = [];
                                thisNextTokensToSearch = [];
                            }
                            thisNextParentTokenAddresses = __spreadArray(__spreadArray([], thisNextParentTokenAddresses, true), nextParentTokenAddresses, true);
                            thisNextTokensToSearch = __spreadArray(__spreadArray([], thisNextTokensToSearch, true), nextTokensToSearch, true);
                            this.tokensChecked.add(tokenAddress);
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        _e.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        if (!thisNextTokensToSearch) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getPoolData({ tokenAddresses: thisNextTokensToSearch, destinationAddress: destinationAddress, parentTokenAddresses: thisNextParentTokenAddresses, poolsFromToken: poolsFromToken, queryParams: queryParams })];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7: return [2 /*return*/, thisNextTokensToSearch];
                }
            });
        });
    };
    /**
     * Get best token path for swap pair.
     * @param param0
     * @returns
     */
    Pathfinder.prototype.getTokenPath = function (_a) {
        var tokenAddress = _a.tokenAddress, destinationAddress = _a.destinationAddress, _b = _a.split, split = _b === void 0 ? false : _b, abortSignal = _a.abortSignal, runtime = _a.runtime;
        return __awaiter(this, void 0, void 0, function () {
            var timeout, badResponse, path;
            var _this = this;
            return __generator(this, function (_c) {
                timeout = new Promise(function (res, rej) {
                    setTimeout(res, _this.maxQueryTime, [tokenAddress, _this.totalAPIRequest]);
                });
                badResponse = [tokenAddress, this.totalAPIRequest];
                path = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var _a, path_1, amts, error_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.addEventListener("abort", function () {
                                    return reject(new Error("Aborted"));
                                });
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 3, , 4]);
                                this.split = split;
                                this.depth = 0;
                                this.nodes = {};
                                this.pathFound = false;
                                this.allPaths = [];
                                this.tokensChecked = new Set();
                                tokenAddress = tokenAddress.toLowerCase();
                                destinationAddress = destinationAddress.toLowerCase();
                                if (destinationAddress === util_2.oceanAddresses[this.chainId].toLowerCase()) {
                                    destinationAddress = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
                                    this.addOcean = "back";
                                }
                                else if (tokenAddress === util_2.oceanAddresses[this.chainId].toLowerCase()) {
                                    tokenAddress = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
                                    this.addOcean = "front";
                                }
                                this.userTokenIn = tokenAddress;
                                this.userTokenOut = destinationAddress;
                                if (tokenAddress === destinationAddress) {
                                    return [2 /*return*/, resolve([[tokenAddress], [], this.totalAPIRequest])];
                                }
                                if (this.totalAPIRequest === 999) {
                                    return [2 /*return*/, resolve(badResponse)];
                                }
                                if (runtime > 198000000) {
                                    return [2 /*return*/, resolve(badResponse)];
                                }
                                return [4 /*yield*/, this.getPoolData({ tokenAddresses: [tokenAddress], destinationAddress: destinationAddress })];
                            case 2:
                                _b.sent();
                                if (this.nodes[destinationAddress]) {
                                    _a = this.constructPath({ destination: this.userTokenOut }), path_1 = _a[0], amts = _a[1];
                                    this.addOcean === "back" ? path_1.push(util_2.oceanAddresses[this.chainId]) : path_1.unshift(util_2.oceanAddresses[this.chainId]);
                                    console.log("Total API requests: ", this.totalAPIRequest);
                                    return [2 /*return*/, resolve([path_1, amts, this.totalAPIRequest])];
                                }
                                return [3 /*break*/, 4];
                            case 3:
                                error_1 = _b.sent();
                                console.log(error_1);
                                return [2 /*return*/, resolve(badResponse)];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/, Promise.race([timeout, path])];
            });
        });
    };
    /**
     * Follows data from destination token to token in.
     * @param param0
     * @returns path as a string[]
     */
    Pathfinder.prototype.constructPath = function (_a) {
        var _this = this;
        var path = _a.path, destination = _a.destination;
        var parent;
        if (path) {
            parent = this.nodes[path[0]].parent;
        }
        else {
            var _b = this.nodes[destination], next = _b.parent, max = _b.max;
            path = [destination];
            parent = next;
        }
        if (parent) {
            path.unshift(parent);
            this.constructPath({ path: path });
        }
        var amts = path.map(function (address) { return _this.nodes[address].max; });
        return [path, amts];
    };
    return Pathfinder;
}());
exports.default = Pathfinder;
var pathfinder = new Pathfinder("137", 1500000000);
pathfinder
    .getTokenPath({
    tokenAddress: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
    destinationAddress: util_2.oceanAddresses["137"],
    split: true,
})
    .then(function (r) {
    fs.writeFileSync("newPath.txt", r.toString());
})
    .catch(console.error);
// console.log("Response from search data: ", nextTokensToSearch);
// three things need to happen at this point if the destination address was not found
// //1. if there are more pools for the token then more data needs to be fetched and searched.
// if (nextTokensToSearch && (t0MatchLength === 1000 || t1MatchLength === 1000)) {
//   if (t0MatchLength === 1000) {
//     skipT0[index] += 1000;
//     callT0[index] = true;
//   } else {
//     callT0[index] = false;
//   }
//   if (t1MatchLength === 1000) {
//     skipT1[index] += 1000;
//     callT1[index] = true;
//   } else {
//     callT1[index] = false;
//   }
//   const newQueryParams: queryParams = {
//     skipT0,
//     skipT1,
//     callT0,
//     callT1,
//   };
//   //console.log("Getting more pool data.");
//   await this.getPoolData({
//     tokenAddress,
//     destinationAddress,
//     parentTokenAddress,
//     amt,
//     IN,
//     poolsFromToken,
//     nextTokensToSearch,
//     queryParams: newQueryParams,
//   });
// }
//2. there are no more pools for the current token, so the pools at the next depth need to be searched
// iterate through next tokens to search, search every token this token has pools with before going deeper (most likely has pool with native)
// if (!skipRecurse && nextTokensToSearch && Object.keys(nextTokensToSearch).length > 0) {
//   const promises = [];
//   for (let [token, value] of Object.entries(nextTokensToSearch)) {
//     // push a promise for each request to getPoolData to promises array
//     promises.push(this.getPoolData({ destinationAddress, tokenAddress: token, parentTokenAddress: value.parent, amt: value.amt, IN, skipRecurse: true }));
//   }
//   // check if token was found or aggregate next pools to search
//   const allSettled = await Promise.allSettled(promises);
//   const tokenFound = allSettled.some((batch) => {
//     if (batch.status === "fulfilled") {
//       if (batch.value === null) {
//         return true;
//       } else {
//         nextTokensToSearch = { ...nextTokensToSearch, ...batch.value };
//       }
//     }
//   });
//   // if pool is found there are no next tokens to search
//   if (tokenFound) nextTokensToSearch = null;
// }
//# sourceMappingURL=Pathfinder.js.map