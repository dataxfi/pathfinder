import { asyncErrorBoundary } from "../../../src/errors";
import { checkParams, oceanAddresses } from "../../util";
import axios from "axios";

const getPaths = async (link: string) => {
  const pathResponse = await axios.get(link);
  console.log();
  return pathResponse.data;
};
const pathsToOceanLink = "https://github.com/dataxfi/pathfinder/blob/main/storage/chain137/pathsToOcean.json";
const pathsFromOceanLink = "https://github.com/dataxfi/pathfinder/blob/main/storage/chain137/pathsFromOcean.json";

export const post = asyncErrorBoundary(async (req, res) => {
  const { chainId, tokenIn, tokenOut } = req.body;
  checkParams(chainId, tokenIn, tokenOut);
  let path = null;

  if (tokenIn === oceanAddresses[chainId]) {
    const paths = await getPaths(pathsFromOceanLink);
    path = paths[tokenOut];
  } else {
    const paths = await getPaths(pathsToOceanLink);
    path = paths[tokenIn];
  }

  res.json({
    status: 200,
    path,
  });
});

export const getPathsToOcean = asyncErrorBoundary(async (req, res) => {
  const pathData = await getPaths(pathsToOceanLink);
  res.json({
    status: 200,
    paths: pathData.data,
  });
});

export const getPathsFromOcean = asyncErrorBoundary(async (req, res) => {
  const pathData = await getPaths(pathsFromOceanLink);
  res.json({
    status: 200,
    paths: pathData.data,
  });
});
// await axios.get('https://github.com/dataxfi/pathfinder/blob/main/storage/reFetch.json');
