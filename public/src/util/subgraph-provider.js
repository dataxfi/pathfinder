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
exports.mainnetPools = exports.maticPools = void 0;
var subgraph_requests_1 = require("./subgraph-requests");
var minAmt = "100";
/**
 * Returns set of all pools which contain provided address from Energyweb chain (246)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
// export async function energywebPools(address: string[], skipT0: number[], skipT1: number[], callT0: boolean[], callT1: boolean[]) {
//   await new Promise((res) => (setTimeout(()=>{res(""), 25})))
//   return await uniswapV3Req("https://ewc-subgraph-production.carbonswap.exchange/subgraphs/name/carbonswap/uniswapv2", address, skipT0, skipT1, callT0, callT1);
// }
/**
 * Returns set of all pools which contain provided address from matic chain (137)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
function maticPools(address, split, skipT0, skipT1, callT0, callT1) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (res) {
                        return setTimeout(function () {
                            res(""), 25;
                        });
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, subgraph_requests_1.uniswapV2Req)("https://polygon.furadao.org/subgraphs/name/quickswap", split, address, skipT0, skipT1, callT0, callT1)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.maticPools = maticPools;
/**
 * Returns set of all pools which contain provided address from mainnet (1)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
function mainnetPools(address, split, skipT0, skipT1, callT0, callT1) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (res) {
                        return setTimeout(function () {
                            res(""), 25;
                        });
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, subgraph_requests_1.uniswapV2Req)("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2", split, address, skipT0, skipT1, callT0, callT1)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.mainnetPools = mainnetPools;
/**
 * Returns set of all pools which contain provided address from bsc chain (56)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
// export async function bscPools(address: string[], skipT0: number[], skipT1: number[], callT0: boolean[], callT1: boolean[]) {
//   await new Promise((res) => (setTimeout(()=>{res(""), 25})))
//   return await uniswapV3Req("https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2", address, skipT0, skipT1, callT0, callT1);
// }
/**
 * Returns set of all pools which contain provided address from moonriver chain (1285)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
// export async function moonriverPools(address: string[], skipT0: number[], skipT1: number[], callT0: boolean[], callT1: boolean[]) {
//   await new Promise((res) => (setTimeout(()=>{res(""), 25})))
//   return await uniswapV3Req("https://api.thegraph.com/subgraphs/name/solarbeamio/amm-v2", address, skipT0, skipT1, callT0, callT1);
// }
/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
// export async function rinkebyPools(address: string[], skipT0: number[], skipT1: number[], callT0: boolean[], callT1: boolean[]) {
//   await new Promise((res) => (setTimeout(()=>{res(""), 25})))
//   return await uniswapV3Req("https://api.thegraph.com/subgraphs/name/mtahon/uniswap-v3-rinkeby", address, skipT0, skipT1, callT0, callT1);
// }
//# sourceMappingURL=subgraph-provider.js.map