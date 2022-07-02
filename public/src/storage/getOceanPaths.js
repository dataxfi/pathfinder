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
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var pathfinder_1 = require("../pathfinder");
var fs = require("fs");
var oceanAddresses = {
    "1": "0x967da4048cD07aB37855c090aAF366e4ce1b9F48",
    "4": "0x8967bcf84170c91b0d24d4302c2376283b0b3a07",
    "56": "0xdce07662ca8ebc241316a15b611c89711414dd1a",
    "137": "0x282d8efCe846A88B159800bd4130ad77443Fa1A1",
    "246": "0x593122aae80a6fc3183b2ac0c4ab3336debee528",
    "1285": "0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE",
};
/**
 * Given an array of chains, will fetch each chains token list and proceed to find user pathfinder
 * to find token paths to and from ocean for every token in the list.
 * @param chains
 */
function getTokenPaths(chains) {
    return __awaiter(this, void 0, void 0, function () {
        var urls, tokenLists, _i, chains_1, chain, tokens, _a, _b, _c, chain, list, maxQueryTime, reFetch, pathfinder, pathToPathsFromOcean, pathToPathsToOcean, existingPathFromOcean, existingPathsToOcean, tokenCount, _d, list_1, token, tokenAddress, destinationAddress, path, error_1;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
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
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 12, , 13]);
                    _i = 0, chains_1 = chains;
                    _f.label = 2;
                case 2:
                    if (!(_i < chains_1.length)) return [3 /*break*/, 5];
                    chain = chains_1[_i];
                    console.log("Getting token list for chain: ", chain);
                    return [4 /*yield*/, axios_1.default.get(urls[chain])];
                case 3:
                    tokens = (_f.sent()).data.tokens;
                    tokenLists[chain] = tokens;
                    console.log("Token amount on chain:", tokens.length);
                    _f.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    _a = 0, _b = Object.entries(tokenLists);
                    _f.label = 6;
                case 6:
                    if (!(_a < _b.length)) return [3 /*break*/, 11];
                    _c = _b[_a], chain = _c[0], list = _c[1];
                    maxQueryTime = (3500 / list.length) * 1000;
                    reFetch = (_e = {}, _e[chain] = [], _e);
                    if (!(list.length > 0)) return [3 /*break*/, 10];
                    pathfinder = new pathfinder_1.Pathfinder(chain, maxQueryTime);
                    pathToPathsFromOcean = "src/storage/chain".concat(chain, "/pathsFromOcean.json");
                    pathToPathsToOcean = "src/storage/chain".concat(chain, "/pathsToOcean.json");
                    existingPathFromOcean = fs.readFileSync(pathToPathsFromOcean).toJSON();
                    existingPathsToOcean = fs.readFileSync(pathToPathsToOcean).toJSON();
                    tokenCount = 0;
                    _d = 0, list_1 = list;
                    _f.label = 7;
                case 7:
                    if (!(_d < list_1.length)) return [3 /*break*/, 10];
                    token = list_1[_d];
                    tokenCount++;
                    tokenAddress = token.address;
                    destinationAddress = oceanAddresses[chain];
                    console.log("Finding path for: " + tokenAddress, " " + tokenCount + " of " + list.length);
                    return [4 /*yield*/, pathfinder.getTokenPath({ tokenAddress: tokenAddress, destinationAddress: destinationAddress })];
                case 8:
                    path = _f.sent();
                    if (Array.isArray(path)) {
                        existingPathsToOcean[tokenAddress] = path;
                        existingPathFromOcean[tokenAddress] = Array.isArray(path) ? path.reverse() : null;
                        fs.writeFileSync(pathToPathsFromOcean, JSON.stringify(existingPathFromOcean));
                        fs.writeFileSync(pathToPathsToOcean, JSON.stringify(existingPathsToOcean));
                    }
                    else {
                        reFetch[chain].push(path);
                        fs.writeFileSync("src/storage/getOceanPaths.ts", JSON.stringify(reFetch));
                    }
                    _f.label = 9;
                case 9:
                    _d++;
                    return [3 /*break*/, 7];
                case 10:
                    _a++;
                    return [3 /*break*/, 6];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_1 = _f.sent();
                    console.error(error_1);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
getTokenPaths(["137"]).then(function () { return console.log("All done yo!"); });
//# sourceMappingURL=getOceanPaths.js.map