import * as express from "express";
import { methodNotAllowed } from "../../../src/errors";
import { getPathsFromOcean, getPathsToOcean, getRefetchTokens, post } from "./controller";
const v2_storage = express.Router();

v2_storage.route("/").post(post).all(methodNotAllowed);
v2_storage.route("/pathsFromOcean").get(getPathsFromOcean).all(methodNotAllowed);
v2_storage.route("/pathsToOcean").get(getPathsToOcean).all(methodNotAllowed);
v2_storage.route("/refetch").get(getRefetchTokens).all(methodNotAllowed);


export { v2_storage };
