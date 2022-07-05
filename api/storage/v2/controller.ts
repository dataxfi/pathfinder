import { asyncErrorBoundary } from "../../../src/errors";
import { checkParams } from "../../util";
import * as fs from "fs";
import path from 'path'

export const post = asyncErrorBoundary(async (req, res) => {
  const { chainId, tokenIn, tokenOut } = req.body;
  checkParams(chainId, tokenIn, tokenOut);
  let pathData = null;
//   const pathsToOcean = JSON.parse(fs.readFileSync(`public/data/chain${chainId}/pathsFromOcean.json`).toString());
//   const pathsFromOcean = JSON.parse(fs.readFileSync(`public/data/chain${chainId}/pathsToOcean.json`).toString());
//   const oceanAddresses = JSON.parse(fs.readFileSync(`public/data/oceanAddresses.json`).toString());


//   if (tokenIn === oceanAddresses[chainId]) {
//     pathData = pathsFromOcean[tokenOut];
//   } else {
//     pathData = pathsToOcean[tokenIn];
//   }

  if (!pathData) pathData = null;

//   res.json({
//     status: 200,
//     pathData,
//   });

res.sendFile('pathsFromOcean.json', {root: path.join(__dirname, 'public')});
});
