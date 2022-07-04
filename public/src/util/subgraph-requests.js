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
exports.uniswapV2Req = void 0;
var axios_1 = require("axios");
var format_response_1 = require("./format-response");
var subgraph_queries_1 = require("./subgraph-queries");
/**
 * Returns an axios response from the url provided.
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
function uniswapV2Req(url, split, addresses, skipT0, skipT1, callT0, callT1) {
    return __awaiter(this, void 0, void 0, function () {
        var request, allData, checkFailed, apiRequestCount, queries, _i, queries_1, query, response, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = function (query) {
                        return axios_1.default.post(url, {
                            query: query,
                        }, { timeout: 600000 });
                    };
                    allData = {};
                    checkFailed = function (response) {
                        var _a;
                        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.errors)
                            throw new Error("Failed to call subgraph");
                    };
                    apiRequestCount = 0;
                    queries = (0, subgraph_queries_1.uniswapV2Query)(addresses, split, skipT0, skipT1, callT0, callT1);
                    if (!(split && Array.isArray(queries))) return [3 /*break*/, 5];
                    _i = 0, queries_1 = queries;
                    _a.label = 1;
                case 1:
                    if (!(_i < queries_1.length)) return [3 /*break*/, 4];
                    query = queries_1[_i];
                    apiRequestCount++;
                    return [4 /*yield*/, request(query)];
                case 2:
                    response = _a.sent();
                    checkFailed(response);
                    allData = __assign(__assign({}, allData), response.data.data);
                    console.log("Response received.");
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    apiRequestCount++;
                    return [4 /*yield*/, request(queries)];
                case 6:
                    response = _a.sent();
                    checkFailed(response);
                    allData = response.data.data;
                    _a.label = 7;
                case 7: return [2 /*return*/, [(0, format_response_1.formatter)(allData, addresses), apiRequestCount]];
            }
        });
    });
}
exports.uniswapV2Req = uniswapV2Req;
/**
 * Returns an axios response from the url provided.
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
// export async function uniswapV3Req(url: string, address: string[], skipT0: number[], skipT1: number[], callT0: boolean[], callT1: boolean[]) {
//   try {
//     const uniswap = await axios.post(
//       url,
//       {
//         query: uniswapV3Query(address, skipT0, skipT1, callT0, callT1),
//       },
//       { timeout: 600000 }
//     );
//     // console.info("Response for token" + address + ":" + uniswap);
//     return formatter(uniswap);
//   } catch (error) {
//     console.error(error);
//   }
// }
//# sourceMappingURL=subgraph-requests.js.map