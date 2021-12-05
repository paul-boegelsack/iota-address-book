module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        'fs/promises': '<rootDir>/node_modules/fs-extra/lib/fs',
    },
}
