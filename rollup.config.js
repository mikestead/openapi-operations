import path from "path";
import buble from "rollup-plugin-buble";

const pkg = require("./package.json");
const external = Object.keys(pkg.dependencies || {});

export default {
  entry: "src/index.js",
  plugins: [buble()],
  external,
  sourceMap: path.resolve(pkg.main),
  targets: [
    {
      format: "cjs",
      dest: pkg.main
    },
    {
      format: "es",
      dest: pkg.module
    }
  ]
};
