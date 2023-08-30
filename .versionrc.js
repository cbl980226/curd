/**
 * @see https://github.com/conventional-changelog/conventional-changelog-config-spec/tree/master/versions/2.2.0#conventional-changelog-configuration-spec-v210
 */
module.exports = {
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'test', section: 'Tests' },
    { type: 'docs', section: 'Docs' },
    { type: 'chore', section: 'Chore' },
    { type: 'style', section: 'Styles' },
    { type: 'refactor', section: 'Refactor' },
    { type: 'perf', section: 'Performance' },
    { type: 'ci', hidden: true },
    { type: 'build', hidden: true },
    { type: 'revert', hidden: true }
  ]
}
