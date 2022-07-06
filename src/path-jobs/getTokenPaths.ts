import axios from "axios";
import { supportedChains, ITokenInfoList, IReFetch } from "../@types";
import { Pathfinder } from "../pathfinder";
import * as fs from "fs";
import * as process from "process";

const oceanAddresses = JSON.parse(fs.readFileSync(`src/util/oceanAddresses.json`).toString());

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
        const refetchList = JSON.parse(fs.readFileSync(`storage/chain${chain}/refetch.json`).toString()) as unknown as ITokenInfoList;

        delete refetchList["type"];
        delete refetchList["data"];
        const refetchTokenAmt = refetchList[chain].length;

        if (refetchTokenAmt === 0) {
          console.log("No tokens to refetch.");
          return;
        } else {
          console.log("Refetch token amount: ", refetchTokenAmt);
          tokenLists[chain] = refetchList[chain];
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

    let runtime;
    let interval;
    if (isRefetch) {
      interval = setInterval(() => {
        if (runtime % 30000 === 0) {
          console.log("Job has been running for " + runtime / 60000 + "hours");
        }

        runtime += 60000;
      }, 60000);
    }

    for (let [chain, list] of Object.entries(tokenLists)) {
      console.log("On chain" + chain + ", list:", list);
      // max time for a github job is 6 hours, so limit the query time by list length
      // if this is a refetch run, limit the total job runtime instead of each query
      // using 20000 instead of 21600 to allow time for pre/post actions
      const maxQueryTime = isRefetch ? 18000000 : (20000 / list.length) * 1000;
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
          const [path, amts, totalAPIRequest] = await pathfinder.getTokenPath({ tokenAddress, destinationAddress, split: false, runtime });
          if (totalAPIRequest === 999) {
            // max api request for github action is 1000, so add token tokens to reFetch and try again in an hour
            writeToReFetch(path);
          } else if (Array.isArray(path) && Array.isArray(amts)) {
            addItem("apiRequestCount", totalAPIRequest);
            addItem("pathCount", Object.keys(existingPathFromOcean).length);
            existingPathsToOcean[tokenAddress] = { path, amts };
            const reversePath = path.reverse()
            const reverseAmts = amts.reverse()
            existingPathFromOcean[tokenAddress] = {path:reversePath, amts: reverseAmts };
            removeUnusedData();
            fs.writeFileSync(pathToPathsFromOcean, JSON.stringify(existingPathFromOcean));
            fs.writeFileSync(pathToPathsToOcean, JSON.stringify(existingPathsToOcean));
          } else {
            writeToReFetch(path);
          }
        }
      }
    }

    clearInterval(interval);
    return;
  } catch (error) {
    console.error(error);
  }
}

// call getTokenPaths for with ocean address and refetch param
console.log("getTokenPaths.js called with: ", process.argv);
let isRefetch;
if (process.argv.length === 3) isRefetch = true;
getTokenPaths(["137"], oceanAddresses["137"], isRefetch).then(()=>{console.log("Done")});
