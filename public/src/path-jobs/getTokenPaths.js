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
exports.getTokenPaths = void 0;
var axios_1 = require("axios");
var pathfinder_1 = require("../pathfinder");
var fs = require("fs");
var process = require("process");
var oceanAddresses = JSON.parse(fs.readFileSync("src/util/oceanAddresses.json").toString());
/**
 * Given an array of chains, will fetch each chains token list and proceed to find user pathfinder
 * to find token paths to and from ocean for every token in the list.
 * @param chains
 */
function getTokenPaths(chains, destinationAddress, isRefetch) {
    return __awaiter(this, void 0, void 0, function () {
        var urls, tokenLists, _i, chains_1, chain, refetchList, refetchTokenAmt, tokens, runtime_1, interval, _loop_1, _a, _b, _c, chain, list, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("Getting token paths for chains:", chains);
                    urls = {
                        "137": "https://unpkg.com/quickswap-default-token-list@1.2.26/build/quickswap-default.tokenlist.json",
                    };
                    tokenLists = {
                        "137": [],
                        "1": [],
                        "1285": [],
                        "246": [],
                        "4": [],
                        "56": [],
                    };
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 11, , 12]);
                    _i = 0, chains_1 = chains;
                    _d.label = 2;
                case 2:
                    if (!(_i < chains_1.length)) return [3 /*break*/, 6];
                    chain = chains_1[_i];
                    if (!isRefetch) return [3 /*break*/, 3];
                    console.log("Refetching tokens with split queries for chain: ", chain);
                    refetchList = JSON.parse(fs.readFileSync("storage/refetch.json").toString());
                    delete refetchList["type"];
                    delete refetchList["data"];
                    refetchTokenAmt = refetchList[chain].length;
                    if (refetchTokenAmt === 0) {
                        console.log("No tokens to refetch.");
                        return [2 /*return*/];
                    }
                    else {
                        console.log("Refetch token amount: ", refetchTokenAmt);
                        tokenLists[chain] = refetchList[chain];
                    }
                    return [3 /*break*/, 5];
                case 3:
                    console.log("Getting token list for chain: ", chain);
                    return [4 /*yield*/, axios_1.default.get(urls[chain])];
                case 4:
                    tokens = (_d.sent()).data.tokens;
                    tokenLists[chain] = tokens;
                    console.log("Token amount on chain:", tokens.length);
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6:
                    interval = void 0;
                    if (isRefetch) {
                        interval = setInterval(function () {
                            if (runtime_1 % 30000 === 0) {
                                console.log("Job has been running for " + runtime_1 / 60000 + "hours");
                            }
                            runtime_1 += 60000;
                        }, 60000);
                    }
                    _loop_1 = function (chain, list) {
                        var maxQueryTime, reFetch, pathfinder, pathToPathsFromOcean, pathToPathsToOcean, existingPathFromOcean_1, existingPathsToOcean_1, tokenCount, writeToReFetch, addItem, removeUnusedData, _e, list_1, token, tokenAddress, _f, path, amts, totalAPIRequest, reversePath, reverseAmts;
                        var _g, _h, _j;
                        return __generator(this, function (_k) {
                            switch (_k.label) {
                                case 0:
                                    console.log("On chain" + chain + ", list:", list);
                                    maxQueryTime = isRefetch ? 18000000 : (20000 / list.length) * 1000;
                                    console.log("Max query time for each token: ", maxQueryTime);
                                    reFetch = (_g = {}, _g[chain] = [], _g);
                                    if (!(list.length > 0)) return [3 /*break*/, 4];
                                    pathfinder = new pathfinder_1.Pathfinder(chain, maxQueryTime);
                                    pathToPathsFromOcean = "storage/chain".concat(chain, "/pathsFromOcean.json");
                                    pathToPathsToOcean = "storage/chain".concat(chain, "/pathsToOcean.json");
                                    existingPathFromOcean_1 = fs.readFileSync(pathToPathsFromOcean).toJSON();
                                    existingPathsToOcean_1 = fs.readFileSync(pathToPathsToOcean).toJSON();
                                    tokenCount = 0;
                                    writeToReFetch = function (address) {
                                        console.log("Writing to reFetch: " + address);
                                        reFetch[chain].push({ address: address });
                                        fs.writeFileSync("storage/reFetch.json", JSON.stringify(reFetch));
                                    };
                                    addItem = function (key, value) {
                                        existingPathFromOcean_1[key] = value;
                                        existingPathsToOcean_1[key] = value;
                                    };
                                    removeUnusedData = function () {
                                        delete existingPathFromOcean_1["type"];
                                        delete existingPathFromOcean_1["data"];
                                        delete existingPathsToOcean_1["type"];
                                        delete existingPathsToOcean_1["data"];
                                    };
                                    addItem("listCount", list.length);
                                    _e = 0, list_1 = list;
                                    _k.label = 1;
                                case 1:
                                    if (!(_e < list_1.length)) return [3 /*break*/, 4];
                                    token = list_1[_e];
                                    tokenCount++;
                                    tokenAddress = token.address;
                                    console.log("Finding path for: " + tokenAddress, " " + tokenCount + " of " + list.length);
                                    return [4 /*yield*/, pathfinder.getTokenPath({ tokenAddress: tokenAddress, destinationAddress: destinationAddress, split: false, runtime: runtime_1 })];
                                case 2:
                                    _f = _k.sent(), path = _f[0], amts = _f[1], totalAPIRequest = _f[2];
                                    console.log(path);
                                    if (totalAPIRequest === 999) {
                                        // max api request for github action is 1000, so add token tokens to reFetch and try again in an hour
                                        writeToReFetch(path);
                                    }
                                    else if (Array.isArray(path) && Array.isArray(amts)) {
                                        existingPathsToOcean_1 = __assign(__assign({}, existingPathsToOcean_1), (_h = {}, _h[tokenAddress.toLowerCase()] = { path: path, amts: amts }, _h));
                                        addItem("apiRequestCount", totalAPIRequest);
                                        addItem("pathCount", Object.keys(existingPathFromOcean_1).length);
                                        reversePath = path.slice().reverse();
                                        reverseAmts = amts.slice().reverse();
                                        console.log(path, reversePath);
                                        existingPathFromOcean_1 = __assign(__assign({}, existingPathFromOcean_1), (_j = {}, _j[tokenAddress.toLowerCase()] = { path: reversePath, amts: reverseAmts }, _j));
                                        removeUnusedData();
                                        fs.writeFileSync(pathToPathsFromOcean, JSON.stringify(existingPathFromOcean_1));
                                        fs.writeFileSync(pathToPathsToOcean, JSON.stringify(existingPathsToOcean_1));
                                    }
                                    else {
                                        writeToReFetch(path);
                                    }
                                    _k.label = 3;
                                case 3:
                                    _e++;
                                    return [3 /*break*/, 1];
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _a = 0, _b = Object.entries(tokenLists);
                    _d.label = 7;
                case 7:
                    if (!(_a < _b.length)) return [3 /*break*/, 10];
                    _c = _b[_a], chain = _c[0], list = _c[1];
                    return [5 /*yield**/, _loop_1(chain, list)];
                case 8:
                    _d.sent();
                    _d.label = 9;
                case 9:
                    _a++;
                    return [3 /*break*/, 7];
                case 10:
                    clearInterval(interval);
                    return [2 /*return*/];
                case 11:
                    error_1 = _d.sent();
                    console.error(error_1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
exports.getTokenPaths = getTokenPaths;
// call getTokenPaths with ocean address and refetch param
console.log("getTokenPaths.js called with: ", process.argv);
var isRefetch;
if (process.argv.length === 3)
    isRefetch = true;
getTokenPaths(["137"], oceanAddresses["137"], isRefetch).then(function () {
    console.log("Done");
});
//# sourceMappingURL=getTokenPaths.js.map