module.exports = {
    css: {
        loaderOptions: {
            sass: {
                includePaths: ["./node_modules"]
            }
        }
    },
    configureWebpack: {
        devtool: "sourcemap"
    }
};