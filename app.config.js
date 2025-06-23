export default ({ config }) => {
    return {
        ...config,
        name:  process.env.ANDROID_NAME || "Smart Money",
        android: {
            package: process.env.ANDROID_PACKAGE || "com.koucheng.smartmoney"
        }
    };
};
