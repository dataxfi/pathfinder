import * as express from "express";
import { methodNotAllowed } from "../../../src/errors";
import { post } from "./controller";
const v2_pathfinder = express.Router();

v2_pathfinder.route("/").post(post).all(methodNotAllowed);

export { v2_pathfinder };
