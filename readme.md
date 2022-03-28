## Pathfinder 
> A module leveraging subgraph data from api.thegraph.com, respective to `chainId`, to determine swap paths for token pairs. 

### Usage

```
const pathfinder = new Pathfinder(1);
try {
  const Path = pathfinder.getTokenPath({
    tokenInAddress: "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
    tokenOutAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    IN: true,
  });
} catch (error) {
    //handle error
}
```

### API

getPoolsForToken

Makes request for pools associated to a token, sets nodes on the graph for each pool.
Returns the next tokens to be searched OR null if a path can be made.
```  
pathfinder.getPoolsForToken({
    tokenAddress,
    destinationAddress,
    parentPoolAddress,
    IN,
    amt,
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    parentPoolAddress: string;
    amt?: string;
  }): Promise<INextTokensToSearch | null>
  ```


getTokenPath 

Gets token path for a swap pair. Returns an array of tokens to be traded in order to route to the destination token, optimised to be the shortes path possible.

   ```
    pathfinder.getTokenPath({
    tokenInAddress,
    tokenOutAddress,
    parentPoolAddress,
    amt,
    abortSignal,
    IN,
  }: {
    tokenInAddress: string;
    tokenOutAddress: string;
    IN: boolean;
    parentPoolAddress?: string;
    amt?: string;
    abortSignal?: AbortSignal;
  }): Promise<string[]>
  ```