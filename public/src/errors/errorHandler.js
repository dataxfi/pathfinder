"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
/**
 * Express API error handler.
 */
function errorHandler(error, request, response, next) {
    var _a = error.status, status = _a === void 0 ? 500 : _a, _b = error.message, message = _b === void 0 ? "Something went wrong!" : _b;
    response.status(status).json({ error: message });
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map