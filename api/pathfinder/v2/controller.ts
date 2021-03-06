import { asyncErrorBoundary } from "../../../src/errors";
import { Pathfinder } from "../../../src/pathfinder";
import { checkParams, oceanAddresses } from "../../util";

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

