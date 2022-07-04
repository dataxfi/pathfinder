import axios from "axios";
import { supportedChains, ITokenInfoList, IReFetch, ITokenInfo } from "../@types";
import { Pathfinder } from "../pathfinder";
import * as fs from "fs";
import * as process from "process";

export const oceanAddresses = {
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
export async function getTokenPaths(chains: supportedChains[], destinationAddress: string, isRefetch: boolean) {
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
      if (isRefetch) {
        console.log("Refetching tokens with split queries for chain: ", chain);
        const refetchList = fs.readFileSync("src/path-jobs/getTokenPaths.ts").toJSON() as unknown as ITokenInfo[];
        delete refetchList["type"];
        delete refetchList["buffer"];
        if (Object(refetchList).keys().length === 0) {
          console.log("No tokens to refetch.");
          return;
        }
      } else {
        console.log("Getting token list for chain: ", chain);
        const {
          data: { tokens },
        } = await axios.get(urls[chain]);

        tokenLists[chain] = tokens;
        console.log("Token amount on chain:", tokens.length);
      }
    }

    for (let [chain, list] of Object.entries(tokenLists)) {
      // max time for a github job is 6 hours, so limit the query time by list length
      // using 20000 instead of 21600 to allow time for pre/post actions
      const maxQueryTime = (20000 / list.length) * 1000;
      console.log("Max query time for each token: ", maxQueryTime);

      //collect failed addresses
      const reFetch: IReFetch = { [chain]: [] };

      if (list.length > 0) {
        const pathfinder = new Pathfinder(chain as supportedChains, maxQueryTime);
        const pathToPathsFromOcean = `storage/chain${chain}/pathsFromOcean.json`;
        const pathToPathsToOcean = `storage/chain${chain}/pathsToOcean.json`;
        const existingPathFromOcean = fs.readFileSync(pathToPathsFromOcean).toJSON();
        const existingPathsToOcean = fs.readFileSync(pathToPathsToOcean).toJSON();
        let tokenCount = 0;

        const writeToReFetch = (address) => {
          console.log("Writing to reFetch: " + address);
          reFetch[chain].push({ address });
          fs.writeFileSync(`storage/reFetch.json`, JSON.stringify(reFetch));
        };

        const addItem = (key: string, value: any) => {
          existingPathFromOcean[key] = value;
          existingPathsToOcean[key] = value;
        };

        const removeUnusedData = () => {
          delete existingPathFromOcean["type"];
          delete existingPathFromOcean["data"];
          delete existingPathsToOcean["type"];
          delete existingPathsToOcean["data"];
        };

        addItem("listCount", list.length);

        for (const token of list) {
          tokenCount++;
          const tokenAddress = token.address;

          console.log("Finding path for: " + tokenAddress, " " + tokenCount + " of " + list.length);
          const [path, amts, totalAPIRequest] = await pathfinder.getTokenPath({ tokenAddress, destinationAddress, split: false });
          if (totalAPIRequest === 999) {
            // max api request for github action is 1000, so add token tokens to reFetch and try again in an hour
            writeToReFetch(path);
          } else if (Array.isArray(path) && Array.isArray(amts)) {
            addItem("apiRequestCount", totalAPIRequest);
            addItem("pathCount", Object.keys(existingPathFromOcean).length);
            existingPathsToOcean[tokenAddress] = { path, amts };
            existingPathFromOcean[tokenAddress] = Array.isArray(path) ? { path: path.reverse(), amts: amts.reverse() } : null;
            removeUnusedData();
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

// call getTokenPaths for with ocean address and refetch param
console.log("getTokenPaths.js called with: ", process.argv);
let isRefetch = JSON.parse(process.argv[process.argv.length - 1]);
if (!isRefetch) isRefetch = false;
getTokenPaths(["137"], oceanAddresses["137"], isRefetch);
