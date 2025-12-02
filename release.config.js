export default {
  // Branches to release from
  branches: ['main'],

  plugins: [
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

    // Publish package to npm and bump version in package.json
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        // Only include these files when publishing to npm
        files: ['dist', 'README.md', 'LICENSE.txt'],
        // If you only want to publish built output, uncomment:
        // pkgRoot: 'dist',
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
    [
      '@semantic-release/github',
      {
        repositoryUrl: 'https://github.com/dolianecom/crypto-toolkit',
      },
    ],
  ],
}
