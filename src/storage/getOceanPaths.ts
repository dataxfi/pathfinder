import axios from "axios";
import { supportedChains, ITokenInfoList, IPathStorage, IReFetch } from "../@types";
import { Pathfinder } from "../pathfinder";
import * as fs from "fs";

const oceanAddresses = {
  "1": "0x967da4048cD07aB37855c090aAF366e4ce1b9F48",
  "4": "0x8967bcf84170c91b0d24d4302c2376283b0b3a07",
  "56": "0xdce07662ca8ebc241316a15b611c89711414dd1a",
  "137": "0x282d8efCe846A88B159800bd4130ad77443Fa1A1",
  "246": "0x593122aae80a6fc3183b2ac0c4ab3336debee528",
  "1285": "0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE",
};

/**
 * Given an array of chains, will fetch each chains token list and proceed to find user pathfinder
 * to find token paths to and from ocean for every token in the list.
 * @param chains
 */
async function getTokenPaths(chains: supportedChains[]) {
  console.log("Getting token paths for chains:", chains);
  const urls = {
    "137": "https://unpkg.com/quickswap-default-token-list@1.2.26/build/quickswap-default.tokenlist.json",
  };

  const tokenLists: ITokenInfoList = {
    "137": [],
    "1": [],
    "1285": [],
    "246": [],
    "4": [],
    "56": [],
  };

  try {
    for (const chain of chains) {
      console.log("Getting token list for chain: ", chain);
      const {
        data: { tokens },
      } = await axios.get(urls[chain]);

      tokenLists[chain] = tokens;
      console.log("Token amount on chain:", tokens.length);
    }

    for (let [chain, list] of Object.entries(tokenLists)) {
      // max time for a github job is 1 hour, so limit the query time by list length
      const maxQueryTime = (3500 / list.length) * 1000;

      //collect failed addresses
      const reFetch: IReFetch = { [chain]: [] };
      
      //TODO: run a second job for the path for failed tokens

      if (list.length > 0) {
        const pathfinder = new Pathfinder(chain as supportedChains, maxQueryTime);
        const pathToPathsFromOcean = `src/storage/chain${chain}/pathsFromOcean.json`;
        const pathToPathsToOcean = `src/storage/chain${chain}/pathsToOcean.json`;
        const existingPathFromOcean = fs.readFileSync(pathToPathsFromOcean).toJSON();
        const existingPathsToOcean = fs.readFileSync(pathToPathsToOcean).toJSON();
        let tokenCount = 0;

        const writeToReFetch = (address) => {
          reFetch[chain].push(address);
          fs.writeFileSync(`src/storage/getOceanPaths.ts`, JSON.stringify(reFetch));
        };

        for (const token of list) {
          tokenCount++;
          const tokenAddress = token.address;
          const destinationAddress = oceanAddresses[chain];

          console.log("Finding path for: " + tokenAddress, " " + tokenCount + " of " + list.length);
          const [path, totalAPIRequest] = await pathfinder.getTokenPath({ tokenAddress, destinationAddress });
          if (totalAPIRequest === 999) {
            // max api request for github action is 1000, so add token tokens to reFetch and try again in an hour
            writeToReFetch(path);
          } else if (Array.isArray(path)) {
            existingPathsToOcean[tokenAddress] = path;
            existingPathFromOcean[tokenAddress] = Array.isArray(path) ? path.reverse() : null;
            fs.writeFileSync(pathToPathsFromOcean, JSON.stringify(existingPathFromOcean));
            fs.writeFileSync(pathToPathsToOcean, JSON.stringify(existingPathsToOcean));
          } else {
            writeToReFetch(path);
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

getTokenPaths(["137"]).then(() => console.log("All done yo!"));
