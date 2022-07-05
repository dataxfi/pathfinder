import { asyncErrorBoundary } from "../../../src/errors";
import { checkParams } from "../../util";
import * as fs from "fs";
import pathsFromOcean from './chain137/pathsFromOcean.json'
import pathsToOcean from './chain137/pathsToOcean.json'
import oceanAddresses from './chain137/refetch.json'
export const post = asyncErrorBoundary(async (req, res) => {
  const { chainId, tokenIn, tokenOut } = req.body;
  checkParams(chainId, tokenIn, tokenOut);
  let pathData = null;

  const oceanAddresses = JSON.parse(fs.readFileSync(`public/api/storage/v2/oceanAddresses.json`).toString());


  if (tokenIn === oceanAddresses[chainId]) {
    pathData = pathsFromOcean[tokenOut];
  } else {
    pathData = pathsToOcean[tokenIn];
  }

  if (!pathData) pathData = null;

  res.json({
    status: 200,
    pathData,
  });

});
