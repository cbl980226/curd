try {
  require('husky').install()
} catch (e) {
  // ignore error in CI and PROD
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}
