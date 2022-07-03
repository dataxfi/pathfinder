"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methodNotAllowed = void 0;
function methodNotAllowed(request, response, next) {
    next({
        status: 405,
        message: "".concat(request.method, " not allowed for ").concat(request.originalUrl),
    });
}
exports.methodNotAllowed = methodNotAllowed;
//# sourceMappingURL=methodNotAllowed.js.map