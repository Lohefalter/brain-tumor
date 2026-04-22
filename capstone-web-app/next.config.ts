import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Exclude large model/curve files from the standalone trace — only CSVs are needed at runtime
  outputFileTracingExcludes: {
    '*': ['./Reports/best_models/**', './Reports/pr_curves/**'],
  },
}

export default nextConfig
