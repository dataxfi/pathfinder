"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v2_router = void 0;
var express = require("express");
var errors_1 = require("../../../src/errors");
var controller_1 = require("../../../controllers/pathfinder/v2/controller");
var v2_router = express.Router();
exports.v2_router = v2_router;
v2_router.route("/").post(controller_1.post).all(errors_1.methodNotAllowed);
//# sourceMappingURL=router.js.map