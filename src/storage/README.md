# Storage

The storage in directory holds a script that gets token paths for each token in the list and writes them to respective json files within the same directory. Currently, there are no datatoken pools with a base token other than OCEAN, so `pathsToOcean` and `pathsFromOcean` are all that are considered. 

## Future development
As features on datax increase, the need for more path storage will increase as well. This includes path storage for:

- ERC20 Tokens to other base tokens such as H20
- ERC20 Tokens to other ERC20 tokens 