import { asyncErrorBoundary } from "../../../src/errors";
import { Pathfinder } from "../../../src/pathfinder";

const failed = (param: string) => {
  throw new Error(`Failed to specify ${param} in request body.`);
};

export const post = asyncErrorBoundary(async (req, res) => {
  const { chainId, tokenIn, tokenOut, amt, IN } = req.body;

  if (!chainId) failed("chainId");
  if (!tokenIn) failed("tokenIn");
  if (!tokenOut) failed("tokenOut");
  if (IN === undefined && amt) failed("IN along with amt");
  if (!amt && IN !== undefined) failed("amt along with IN");

  const pathfinder = new Pathfinder(chainId);
  const path = await pathfinder.getTokenPath({
    tokenAddress: tokenIn,
    destinationAddress: tokenOut,
    IN,
    amt,
  });

  res.json({
    status: 200,
    path,
  });
});
