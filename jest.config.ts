/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.[tj]sx?$|\\.mjs$': ['ts-jest', { tsconfig: 'tsconfig.json', isolatedModules: true }]
  },
  transformIgnorePatterns: ['node_modules/(?!(http-proxy-middleware|httpxy|is-plain-obj)/)'],
  moduleFileExtensions: ['ts', 'js', 'mjs', 'json', 'node'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
