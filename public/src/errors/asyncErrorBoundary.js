"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncErrorBoundary = void 0;
function asyncErrorBoundary(delegate, defaultStatus) {
    if (defaultStatus === void 0) { defaultStatus = 400; }
    return function (request, response, next) {
        Promise.resolve()
            .then(function () { return delegate(request, response, next); })
            .catch(function (error) {
            if (error === void 0) { error = {}; }
            var _a = error.status, status = _a === void 0 ? defaultStatus : _a, _b = error.message, message = _b === void 0 ? error : _b;
            next({
                status: status,
                message: message,
            });
        });
    };
}
exports.asyncErrorBoundary = asyncErrorBoundary;
//# sourceMappingURL=asyncErrorBoundary.js.map