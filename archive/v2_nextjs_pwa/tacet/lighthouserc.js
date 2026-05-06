/** @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      url: ["http://localhost:3000", "http://localhost:3000/barometre"],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        // Story 1.6: initial JS transfer size must stay under 300 KB (gzip).
        // Lighthouse reports resource-summary sizes as transfer bytes, which
        // reflects gzip compression when the server uses Content-Encoding: gzip
        // (Next.js enables this by default).
        "resource-summary:script:size": ["error", { maxNumericValue: 307200 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
