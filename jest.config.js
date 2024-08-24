module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/?(*.)+(spec|test).ts"],
    collectCoverage: true,
    coverageReporters: [
        "text",
        "cobertura"
    ]
};