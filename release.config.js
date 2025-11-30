export const branches = ['main']
export const plugins = [
  // Analyze commits to determine next version (major/minor/patch)
  '@semantic-release/commit-analyzer',

  // Generate release notes based on commits
  '@semantic-release/release-notes-generator',

  // Update CHANGELOG.md automatically
  [
    '@semantic-release/changelog',
    {
      changelogFile: 'CHANGELOG.md',
    },
  ],

  // Commit changelog and package.json version bump back to repo
  [
    '@semantic-release/git',
    {
      assets: ['CHANGELOG.md', 'package.json'],
      message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    },
  ],

  // Create a GitHub release with changelog notes
  '@semantic-release/github',

  // Publish package to npm
  [
    '@semantic-release/npm',
    {
      npmPublish: true,
    },
  ],
]
