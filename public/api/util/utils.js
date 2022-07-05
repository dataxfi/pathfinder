"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkParams = exports.failed = void 0;
var failed = function (param) {
    throw new Error("Failed to specify ".concat(param, " in request body."));
};
exports.failed = failed;
var checkParams = function (chain, inToken, out) {
    if (!chain)
        (0, exports.failed)("chainId");
    if (!inToken)
        (0, exports.failed)("tokenIn");
    if (!out)
        (0, exports.failed)("tokenOut");
};
exports.checkParams = checkParams;
//# sourceMappingURL=utils.js.map