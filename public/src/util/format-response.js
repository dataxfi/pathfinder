"use strict";
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
exports.formatter = void 0;
/**
 * Formats query responses into one standard object.
 * @param response
 * @returns IPoolNode[]
 */
function formatter(response, address) {
    var _a;
    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.errors)
        return;
    try {
        var data_1 = response.data.data;
        console.log(response);
        var requestResponse_1 = [];
        address.forEach(function (address) {
            var t0Match = data_1["t0IsMatch".concat(address)];
            var t1Match = data_1["t1IsMatch".concat(address)];
            if (!t0Match)
                t0Match = [];
            if (!t1Match)
                t1Match = [];
            var t0MatchLength = t0Match.length;
            var t1MatchLength = t1Match.length;
            var allMatchedPools = __spreadArray(__spreadArray([], t0Match, true), t1Match, true);
            requestResponse_1.push({
                t0MatchLength: t0MatchLength,
                t1MatchLength: t1MatchLength,
                allMatchedPools: allMatchedPools
            });
        });
        return requestResponse_1;
    }
    catch (error) {
        console.error(error);
    }
}
exports.formatter = formatter;
//# sourceMappingURL=format-response.js.map