const { join } = require("path");
const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");
const svgr = require("vite-plugin-svgr").default;
const tsConfig = require("./tsconfig.paths.json");

const ROOT = __dirname;

const tsPaths = tsConfig.compilerOptions.paths;
const alias = Object.keys(tsPaths).reduce(
  (pathMap, key) => ({
    ...pathMap,
    [key.replace(/\*$/, "")]: join(
      ROOT,
      tsConfig.compilerOptions.baseUrl,
      tsPaths[key][0].replace(/^\.\//, "/").replace(/\*$/, "")
    ),
  }),
  {}
);

module.exports = defineConfig({
  plugins: [react(), svgr()],
  mode: process.env.MODE,
  envDir: process.cwd(),
  root: ROOT,
  resolve: {
    alias,
  },
  server: {
    host: true,
    proxy: {
      "^/api": {
        target: "http://localhost:23001",
      },
    },
  },
});
