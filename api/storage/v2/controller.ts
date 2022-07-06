import { asyncErrorBoundary } from "../../../src/errors";
import { checkParams, oceanAddresses } from "../../util";
import axios from "axios";

const getPaths = async (link: string) => {
  const pathResponse = await axios.get(link);
  return pathResponse.data;
};
const pathsToOceanLink = "https://raw.githubusercontent.com/dataxfi/pathfinder/main/storage/chain137/pathsToOcean.json";
const pathsFromOceanLink = "https://raw.githubusercontent.com/dataxfi/pathfinder/main/storage/chain137/pathsFromOcean.json";

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

  console.log(path);
  res.json({
    status: 200,
    path: path || null,
  });
});

export const getPathsToOcean = asyncErrorBoundary(async (req, res) => {
  const pathData = await getPaths(pathsToOceanLink);
  res.json({
    status: 200,
    paths: pathData || null,
  });
});

export const getPathsFromOcean = asyncErrorBoundary(async (req, res) => {
  const pathData = await getPaths(pathsFromOceanLink);
  res.json({
    status: 200,
    paths: pathData || null,
  });
});

export const getRefetchTokens = asyncErrorBoundary(async (req, res) => {
  const pathData = await getPaths("https://raw.githubusercontent.com/dataxfi/pathfinder/main/storage/reFetch.json");
  res.json({
    status: 200,
    tokens: pathData || null,
  });
});
