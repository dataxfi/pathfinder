import { Pathfinder } from "../../../src/pathfinder";

export async function post(req, res) {
  try {
    const failed = (param: string) => {
      throw new Error(`Failed to specify ${param} in request body.`);
    };

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
      body: { data: { path } },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}
