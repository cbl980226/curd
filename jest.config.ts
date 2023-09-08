/* eslint-disable */
module.exports = {
  displayName: 'curd',
  preset: './jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        // Note: We shouldn't need to include `isolatedModules` here because it's a deprecated config option in TS 5,
        // but setting it to `true` fixes the `ESM syntax is not allowed in a CommonJS module when
        // 'verbatimModuleSyntax' is enabled` error that we're seeing when running our Jest tests.
        isolatedModules: true,
        useESM: true
      }
    ]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage/curd',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/*(*.)@(spec|test).[jt]s?(x)'
  ]
}
