"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oceanAddresses = exports.checkParams = exports.failed = void 0;
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
exports.oceanAddresses = {
    "1": "0x967da4048cD07aB37855c090aAF366e4ce1b9F48",
    "4": "0x8967bcf84170c91b0d24d4302c2376283b0b3a07",
    "56": "0xdce07662ca8ebc241316a15b611c89711414dd1a",
    "137": "0x282d8efCe846A88B159800bd4130ad77443Fa1A1",
    "246": "0x593122aae80a6fc3183b2ac0c4ab3336debee528",
    "1285": "0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE"
};
//# sourceMappingURL=utils.js.map