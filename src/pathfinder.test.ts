import Pathfinder from "./pathfinder";

describe("Pathfinder works for all chains when supplying exact IN to out pair.", () => {
  it("Pathfinder works on mainnet", async () => {
    try {
      const pathfinder = new Pathfinder(1);
      const path = await pathfinder.getTokenPath({
        tokenInAddress: "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
        tokenOutAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        IN: true,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  it("Pathfinder works on matic", async () => {
    try {
      const pathfinder = new Pathfinder(137);
      const path = await pathfinder.getTokenPath({
        tokenInAddress: "0x282d8efce846a88b159800bd4130ad77443fa1a1",
        tokenOutAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        IN: true,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  it("Pathfinder works on energyweb", async () => {
    try {
      const pathfinder = new Pathfinder(246);
      const path = await pathfinder.getTokenPath({
        tokenInAddress: "0x593122aae80a6fc3183b2ac0c4ab3336debee528",
        tokenOutAddress: "0x9dad43ee9e09837aeaca21799c88613e8e7c67dd",
        IN: true,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  it("Pathfinder works on bsc", async () => {
    try {
      const pathfinder = new Pathfinder(56);
      const path = await pathfinder.getTokenPath({
        tokenInAddress: "0xdce07662ca8ebc241316a15b611c89711414dd1a",
        tokenOutAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        IN: true,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
  it("Pathfinder works on moonriver", async () => {
    try {
      const pathfinder = new Pathfinder(1285);
      const path = await pathfinder.getTokenPath({
        tokenInAddress: "0x99c409e5f62e4bd2ac142f17cafb6810b8f0baae",
        tokenOutAddress: "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
        IN: true,
      });
      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      if (error.code && error.code === 1) {
        return;
      }
      throw error;
    }
  });
});
