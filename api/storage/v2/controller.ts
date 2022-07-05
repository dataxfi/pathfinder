import { asyncErrorBoundary } from "../../../src/errors";
import oceanAddresses from '../../../src/util/oceanAddresses.json'
import pathsFromOcean from '../../../storage/chain137/pathsFromOcean.json'
import pathsToOcean from '../../../storage/chain137/pathsToOcean.json'
import { checkParams } from "../../util";


export const post = asyncErrorBoundary(async (req, res) => {
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