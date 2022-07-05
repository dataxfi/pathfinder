"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var api_1 = require("./api");
var errors_1 = require("./src/errors");
var app = express();
app.use(cors());
app.use(express.json());
app.use("/api/pathfinder/v2", api_1.v2_pathfinder);
app.use("/api/storage/v2", api_1.v2_storage);
app.use(errors_1.notFound);
app.use(errors_1.errorHandler);
var PORT = process.env.PORT || 8080;
app.listen(PORT, function () { return console.log("Server is running in port ".concat(PORT)); });
//# sourceMappingURL=index.js.map