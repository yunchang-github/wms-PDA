module.exports = {
  plugins: [
    require("autoprefixer")({
      overrideBrowserslist: ["last 2 version", ">1%", "ios 7"]
    }),
    require("postcss-pxtorem")({
      rootValue: 37.5,
      propList: ["*"]
    })
  ]
};
