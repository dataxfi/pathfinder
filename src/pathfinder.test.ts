import Pathfinder from "./pathfinder";

const pathfinder = new Pathfinder(1);

pathfinder
  .getTokenPath({
    tokenInAddress: "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
    tokenOutAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    IN: true,
  })
  .then(console.log);
