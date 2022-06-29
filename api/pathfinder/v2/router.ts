import * as express from "express";
import { methodNotAllowed } from "../../../src/errors";
import { post } from "./controller";
const v2_router = express.Router();

v2_router.route("/").post(post).all(methodNotAllowed);

export { v2_router };
