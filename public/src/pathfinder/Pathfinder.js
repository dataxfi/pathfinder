"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
// import fs from "fs";
var Pathfinder = /** @class */ (function () {
    function Pathfinder(chainId) {
        this.allPaths = [];
        this.depth = 0;
        this.pathFound = false;
        this.nodes = {};
        this.tokensChecked = new Set();
        this.pendingQueries = new Set();
        this.userTokenIn = "";
        this.userTokenOut = "";
        this.chainId = chainId;
        // this.trade = new Trade(web3, chainId);
        switch (Number(this.chainId)) {
            case 4:
                this.fetchFunction = util_1.rinkebyPools;
                break;
            case 137:
                this.fetchFunction = util_1.maticPools;
                break;
            case 56:
                this.fetchFunction = util_1.bscPools;
                break;
            case 1285:
                this.fetchFunction = util_1.moonriverPools;
                break;
            case 246:
                this.fetchFunction = util_1.energywebPools;
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
        tokenNode[poolNode.poolAddress] = poolNode;
    };
    /**
     * Adds a token node to the main graph.
     * @param tokenAdress The address of the token whos pools are being visited.
     * @param parentTokenAddress The IN token preceeding the prospective OUT tokens.
     */
    Pathfinder.prototype.addTokenNode = function (tokenAdress, parentTokenAddress) {
        if (!parentTokenAddress)
            parentTokenAddress = null;
        this.nodes[tokenAdress] = { parent: parentTokenAddress, pools: {} };
    };
    /**
     * Makes request for pools associated to a token, sets nodes on the graph for each pool.
     * @param param0
     * @returns The next tokens to be searched OR null if a path can be made.
     */
    Pathfinder.prototype.searchPoolData = function (_a) {
        var poolsFromToken = _a.poolsFromToken, tokenAddress = _a.tokenAddress, destinationAddress = _a.destinationAddress, parentTokenAddress = _a.parentTokenAddress, IN = _a.IN, amt = _a.amt;
        return __awaiter(this, void 0, void 0, function () {
            var nextTokensToSearch;
            var _this = this;
            return __generator(this, function (_b) {
                nextTokensToSearch = {};
                // //console.log("Searching pools", nextTokensToSearch, poolsFromToken);
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var i, poolNode, t1IsIn, nextTokenAddress, nextAmt;
                        return __generator(this, function (_a) {
                            try {
                                //iterate pools response adding nodes and edges
                                for (i = 0; i < poolsFromToken.length; i++) {
                                    poolNode = poolsFromToken[i];
                                    t1IsIn = poolNode.t1Address === tokenAddress;
                                    if (this.nodes[tokenAddress]) {
                                        this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
                                    }
                                    else {
                                        this.addTokenNode(tokenAddress, parentTokenAddress);
                                        this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
                                    }
                                    nextTokenAddress = poolNode.t1Address === tokenAddress ? poolNode.t2Address : poolNode.t1Address;
                                    nextAmt = void 0;
                                    if (!IN)
                                        nextAmt = "1"; //await this.trade.getAmountsIn(amt, [parentTokenAddress, nextTokenAddress]);
                                    IN ? (nextTokensToSearch[nextTokenAddress] = { parent: tokenAddress }) : (nextTokensToSearch[nextTokenAddress] = { parent: tokenAddress, amt: nextAmt[0] });
                                    // //if exact token is token in, check if there is enough liquidity to support this swap
                                    // if (IN) {
                                    //   const amountOut = await this.trade.getAmountsOut(amt, [parentTokenAddress, nextTokenAddress]);
                                    //   const liquidityNeeded = t1IsIn ? poolNode.t2Liquidity : poolNode.t1Liquidity;
                                    //   if (amountOut[0] > liquidityNeeded) {
                                    //     resolve(null);
                                    //     return;
                                    //   }
                                    // }
                                    // This will resolve if the destination is found, regardless of whether there might be another
                                    // pool with less fees or more liquidity. The path will be the same even if there is another pool at the current
                                    // search depth, so fees and liquidity are currently being ignored.
                                    if (poolNode.t1Address.toLowerCase() === this.userTokenOut.toLowerCase() || poolNode.t2Address.toLowerCase() === this.userTokenOut.toLowerCase()) {
                                        //console.log("Match found, resolving null.");
                                        this.addTokenNode(destinationAddress, tokenAddress);
                                        this.pathFound = true;
                                        resolve(null);
                                        return [2 /*return*/];
                                    }
                                }
                                resolve(nextTokensToSearch);
                            }
                            catch (error) {
                                reject(error);
                            }
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    /**
     * Recursively calls subgraphs for all relevant pool data for a token.
     * @param tokenAddress The token to get pools for (token in)
     * @param destinationAddress The token to be attained (token out)
     * @param amt The amount of destination token desired
     * @param IN Wether the exact token is the token in
     * @param parentTokenAddress the token that was traded prior to the current token being searched (for recursion)
     * @param queryParams pagination for pool data requests (for recursion)
     * @param poolsFromToken all pool data from token (for recursion)
     * @param nextTokensToSearch all tokens to search next (for recursion)
     * @returns next tokens to search
     */
    Pathfinder.prototype.getPoolData = function (_a) {
        var tokenAddress = _a.tokenAddress, destinationAddress = _a.destinationAddress, amt = _a.amt, IN = _a.IN, parentTokenAddress = _a.parentTokenAddress, _b = _a.queryParams, queryParams = _b === void 0 ? { skipT0: 0, skipT1: 0, callT0: true, callT1: true } : _b, _c = _a.poolsFromToken, poolsFromToken = _c === void 0 ? [] : _c, _d = _a.nextTokensToSearch, nextTokensToSearch = _d === void 0 ? {} : _d, _e = _a.skipRecurse, skipRecurse = _e === void 0 ? false : _e;
        return __awaiter(this, void 0, void 0, function () {
            var skipT0, skipT1, callT0, callT1, response, t0MatchLength, t1MatchLength, allMatchedPools, newQueryParams, promises, _i, _f, _g, token, value, allSettled, tokenFound, error_1;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (this.pathFound) {
                            //console.log("Path already found, returning.");
                            return [2 /*return*/, null];
                        }
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 8, , 9]);
                        tokenAddress = tokenAddress.toLowerCase();
                        destinationAddress = destinationAddress.toLowerCase();
                        skipT0 = queryParams.skipT0, skipT1 = queryParams.skipT1, callT0 = queryParams.callT0, callT1 = queryParams.callT1;
                        // skip tokens already searched
                        if (this.tokensChecked.has(tokenAddress))
                            return [2 /*return*/];
                        // add token address to pending queries and call fetch function with address
                        this.pendingQueries.add(tokenAddress);
                        return [4 /*yield*/, this.fetchFunction(tokenAddress, amt, skipT0, skipT1, callT0, callT1)];
                    case 2:
                        response = _h.sent();
                        console.log("Response for " + tokenAddress, response);
                        t0MatchLength = 0, t1MatchLength = 0, allMatchedPools = [];
                        if (response.t0MatchLength)
                            t0MatchLength = response.t0MatchLength;
                        if (response.t1MatchLength)
                            t1MatchLength = response.t1MatchLength;
                        if (response.allMatchedPools)
                            allMatchedPools = response.allMatchedPools;
                        if (allMatchedPools.length === 0)
                            return [2 /*return*/];
                        poolsFromToken.push.apply(poolsFromToken, allMatchedPools);
                        return [4 /*yield*/, this.searchPoolData({
                                poolsFromToken: poolsFromToken,
                                tokenAddress: tokenAddress,
                                destinationAddress: destinationAddress,
                                IN: IN,
                                parentTokenAddress: parentTokenAddress,
                                amt: amt,
                            })];
                    case 3:
                        //search all matched pools looking for user token out
                        nextTokensToSearch = _h.sent();
                        if (!(nextTokensToSearch && (t0MatchLength === 1000 || t1MatchLength === 1000))) return [3 /*break*/, 5];
                        if (t0MatchLength === 1000) {
                            skipT0 += 1000;
                            callT0 = true;
                        }
                        else {
                            callT0 = false;
                        }
                        if (t1MatchLength === 1000) {
                            skipT1 += 1000;
                            callT1 = true;
                        }
                        else {
                            callT1 = false;
                        }
                        newQueryParams = {
                            skipT0: skipT0,
                            skipT1: skipT1,
                            callT0: callT0,
                            callT1: callT1,
                        };
                        //console.log("Getting more pool data.");
                        return [4 /*yield*/, this.getPoolData({
                                tokenAddress: tokenAddress,
                                destinationAddress: destinationAddress,
                                parentTokenAddress: parentTokenAddress,
                                amt: amt,
                                IN: IN,
                                poolsFromToken: poolsFromToken,
                                nextTokensToSearch: nextTokensToSearch,
                                queryParams: newQueryParams,
                            })];
                    case 4:
                        //console.log("Getting more pool data.");
                        _h.sent();
                        _h.label = 5;
                    case 5:
                        // if the previous condition didnt pass, then all pools have been searched for this token
                        this.pendingQueries.delete(tokenAddress);
                        this.tokensChecked.add(tokenAddress);
                        if (!(!skipRecurse && nextTokensToSearch && Object.keys(nextTokensToSearch).length > 0)) return [3 /*break*/, 7];
                        promises = [];
                        for (_i = 0, _f = Object.entries(nextTokensToSearch); _i < _f.length; _i++) {
                            _g = _f[_i], token = _g[0], value = _g[1];
                            // push a promise for each request to getPoolData to promises array
                            promises.push(this.getPoolData({ destinationAddress: destinationAddress, tokenAddress: token, parentTokenAddress: value.parent, amt: value.amt, IN: IN, skipRecurse: true }));
                        }
                        return [4 /*yield*/, Promise.allSettled(promises)];
                    case 6:
                        allSettled = _h.sent();
                        tokenFound = allSettled.some(function (batch) {
                            if (batch.status === "fulfilled") {
                                if (batch.value === null) {
                                    return true;
                                }
                                else {
                                    nextTokensToSearch = __assign(__assign({}, nextTokensToSearch), batch.value);
                                }
                            }
                        });
                        // if pool is found there are no next tokens to search
                        if (tokenFound)
                            nextTokensToSearch = null;
                        _h.label = 7;
                    case 7: return [2 /*return*/, nextTokensToSearch];
                    case 8:
                        error_1 = _h.sent();
                        console.error("An error occured:", error_1);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets token paths for a swap pair. Recursively calls itself until userTokenOut is found.
     * @param param0
     * @returns An array of tokens to be traded in order to route to the destination token in the shortest path possible.
     */
    Pathfinder.prototype.getTokenPaths = function (_a) {
        var tokenAddress = _a.tokenAddress, destinationAddress = _a.destinationAddress, IN = _a.IN, parentTokenAddress = _a.parentTokenAddress, amt = _a.amt;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var nextTokensToSearch, nextPromises, _i, _a, _b, token, value, path, error_2;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, this.getPoolData({ tokenAddress: tokenAddress, destinationAddress: destinationAddress, parentTokenAddress: parentTokenAddress, amt: amt, IN: IN })];
                                case 1:
                                    nextTokensToSearch = _c.sent();
                                    nextPromises = [];
                                    if (nextTokensToSearch && Object.keys(nextTokensToSearch).length > 0) {
                                        //console.log("No token found for this depth, dispatching next depth with:", Object.entries(nextTokensToSearch).length);
                                        for (_i = 0, _a = Object.entries(nextTokensToSearch); _i < _a.length; _i++) {
                                            _b = _a[_i], token = _b[0], value = _b[1];
                                            if (!this.pathFound)
                                                nextPromises.push(this.getTokenPaths({ destinationAddress: destinationAddress, tokenAddress: token, parentTokenAddress: value.parent, amt: value.amt, IN: IN }));
                                        }
                                    }
                                    //console.log("Total promises made:", nextPromises.length);
                                    return [4 /*yield*/, Promise.allSettled(nextPromises)];
                                case 2:
                                    //console.log("Total promises made:", nextPromises.length);
                                    _c.sent();
                                    //console.log("All promises settled");
                                    if (!nextTokensToSearch && this.nodes[destinationAddress]) {
                                        path = this.constructPath({ destination: this.userTokenOut });
                                        if (path) {
                                            this.allPaths.push(path);
                                        }
                                        resolve("Path found");
                                    }
                                    else {
                                        resolve("No path found");
                                    }
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_2 = _c.sent();
                                    console.error(error_2);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Get best token path for swap pair.
     * @param param0
     * @returns
     */
    Pathfinder.prototype.getTokenPath = function (_a) {
        var tokenAddress = _a.tokenAddress, destinationAddress = _a.destinationAddress, amt = _a.amt, abortSignal = _a.abortSignal, IN = _a.IN;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var path, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.addEventListener("abort", function () {
                                        return reject(new Error("Aborted"));
                                    });
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, , 5]);
                                    this.depth = 0;
                                    this.nodes = {};
                                    this.pathFound = false;
                                    this.allPaths = [];
                                    this.tokensChecked = new Set();
                                    tokenAddress = tokenAddress.toLowerCase();
                                    destinationAddress = destinationAddress.toLowerCase();
                                    if (!this.userTokenIn)
                                        this.userTokenIn = tokenAddress;
                                    if (!this.userTokenOut)
                                        this.userTokenOut = destinationAddress;
                                    if (tokenAddress === destinationAddress) {
                                        return [2 /*return*/, resolve([tokenAddress])];
                                    }
                                    //console.log("Calling get token paths");
                                    return [4 /*yield*/, this.getTokenPaths({ tokenAddress: tokenAddress, destinationAddress: destinationAddress, amt: amt, IN: IN })];
                                case 2:
                                    //console.log("Calling get token paths");
                                    _a.sent();
                                    return [4 /*yield*/, this.resolveAllPaths()];
                                case 3:
                                    path = _a.sent();
                                    return [2 /*return*/, resolve(path)];
                                case 4:
                                    error_3 = _a.sent();
                                    console.error(error_3);
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Follows data from destination token to token in.
     * @param param0
     * @returns path as a string[]
     */
    Pathfinder.prototype.constructPath = function (_a) {
        var path = _a.path, destination = _a.destination;
        try {
            var parent_1;
            if (path) {
                parent_1 = this.nodes[path[0]].parent;
            }
            else {
                path = [destination];
                parent_1 = this.nodes[destination].parent;
            }
            if (parent_1) {
                path.unshift(parent_1);
                this.constructPath({ path: path });
            }
            return path;
        }
        catch (error) {
            console.error(error);
        }
    };
    Pathfinder.prototype.resolveAllPaths = function () {
        return __awaiter(this, void 0, void 0, function () {
            var shortestPath, allPathsResolved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.allSettled(this.allPaths)];
                    case 1:
                        allPathsResolved = _a.sent();
                        allPathsResolved.forEach(function (promise) {
                            if (promise.status === "fulfilled") {
                                var path = promise.value;
                                if (!shortestPath || shortestPath.length > path.length) {
                                    shortestPath = path;
                                }
                            }
                        });
                        //console.log("Shortest path found: ", shortestPath);
                        return [2 /*return*/, shortestPath];
                }
            });
        });
    };
    return Pathfinder;
}());
exports.default = Pathfinder;
// const pathfinder = new Pathfinder("137");
// pathfinder
//   .getTokenPath({
//     tokenAddress: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
//     destinationAddress: "0x282d8efCe846A88B159800bd4130ad77443Fa1A1",
//     IN: true,
//   })
//   .then((r) => console.log("response", r))
//   .catch(console.error);
//# sourceMappingURL=Pathfinder.js.map