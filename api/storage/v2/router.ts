import * as express from "express";
import { methodNotAllowed } from "../../../src/errors";
import { post } from "./controller";
const v2_storage = express.Router();

v2_storage.route("/").post(post).all(methodNotAllowed);

export { v2_storage };