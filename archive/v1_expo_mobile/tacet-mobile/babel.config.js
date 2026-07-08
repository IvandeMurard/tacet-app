module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);
  const isTest = process.env.NODE_ENV === "test";
  return {
    presets: ["babel-preset-expo"],
    // nativewind/babel is a Metro-only plugin; skip in Jest to avoid Babel compat issues
    plugins: isTest ? [] : ["nativewind/babel"],
  };
};
