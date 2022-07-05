import { asyncErrorBoundary } from "../../../src/errors";
import { Pathfinder } from "../../../src/pathfinder";
import pathsFromOcean from "../../../storage/chain137/pathsFromOcean.json";
import pathsToOcean from "../../../storage/chain137/pathsToOcean.json";
import oceanAddresses from "../../../src/util/oceanAddresses.json";
import { checkParams } from "../../util";

export const post = asyncErrorBoundary(async (req, res) => {
  const { chainId, tokenIn, tokenOut } = req.body;
  checkParams(chainId, tokenIn, tokenOut);

  const pathfinder = new Pathfinder(chainId, 30000);
  const path = await pathfinder.getTokenPath({
    tokenAddress: tokenIn,
    destinationAddress: tokenOut,
    split: false,
  });

  if (path) {
    res.json({
      status: 200,
      path,
    });
  } else {
    res.json({
      status: 200,
      path: null,
    });
  }
});

export const get = asyncErrorBoundary(async (req, res) => {
  const { chainId, tokenIn, tokenOut } = req.body;
  checkParams(chainId, tokenIn, tokenOut);
  let pathData = null;

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
