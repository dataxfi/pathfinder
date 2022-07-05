export const failed = (param: string) => {
  throw new Error(`Failed to specify ${param} in request body.`);
};

export const checkParams = (chain: string, inToken: string, out: string) => {
  if (!chain) failed("chainId");
  if (!inToken) failed("tokenIn");
  if (!out) failed("tokenOut");
};
