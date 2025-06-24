export default {
  expo: {
    name: "Oracle Card Creator",
    slug: "oracle-card-creator",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.oracleapp.cardcreator"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.oracleapp.cardcreator"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: []
  }
};