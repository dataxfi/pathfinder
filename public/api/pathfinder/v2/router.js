"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v2_pathfinder = void 0;
var express = require("express");
var errors_1 = require("../../../src/errors");
var controller_1 = require("./controller");
var v2_pathfinder = express.Router();
exports.v2_pathfinder = v2_pathfinder;
v2_pathfinder.route("/").post(controller_1.post).all(errors_1.methodNotAllowed);
//# sourceMappingURL=router.js.map