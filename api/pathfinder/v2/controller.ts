import { asyncErrorBoundary } from "../../../src/errors";
import { Pathfinder } from "../../../src/pathfinder";

const failed = (param: string) => {
  throw new Error(`Failed to specify ${param} in request body.`);
};

export const post = asyncErrorBoundary(async (req, res) => {
  const { chainId, tokenIn, tokenOut } = req.body;

  if (!chainId) failed("chainId");
  if (!tokenIn) failed("tokenIn");
  if (!tokenOut) failed("tokenOut");

  const pathfinder = new Pathfinder(chainId, 30000);
  const path = await pathfinder.getTokenPath({
    tokenAddress: tokenIn,
    destinationAddress: tokenOut,
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
