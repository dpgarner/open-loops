/** Jest drives the pure logic, the store provider and the help dialog under jsdom. */
module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: { url: 'http://localhost/' },
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  // Coverage covers the whole app, not just what the tests happen to import, so
  // a module with no tests shows up as zero rather than vanishing from the report.
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html'],
};
