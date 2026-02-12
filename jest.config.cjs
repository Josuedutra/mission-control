/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['src/memory/**/*.ts', '!src/memory/**/*.test.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    'src/memory/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
