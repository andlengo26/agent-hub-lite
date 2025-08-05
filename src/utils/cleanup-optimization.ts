/**
 * Code cleanup and optimization utilities
 * Provides functions to identify and clean up unused code
 */

import { logger } from '@/lib/logger';

// Patterns to identify potentially unused or problematic code
export const CleanupPatterns = {
  // Development-only code patterns
  devConsoleStatements: /console\.(log|warn|error|debug|info)\([^)]*\);?/g,
  devComments: /\/\/ TODO:|\/\/ FIXME:|\/\/ DEBUG:|\/\/ XXX:/g,
  
  // Type system improvements
  anyTypes: /:\s*any\b/g,
  anyArrays: /:\s*any\[\]/g,
  recordAnyTypes: /Record<string,\s*any>/g,
  
  // React import modernization
  unnecessaryReactImports: /^import\s+React\s+from\s+['"']react['"'];?\s*$/gm,
  defaultReactImports: /^import\s+React,\s*{([^}]+)}\s+from\s+['"']react['"'];?\s*$/gm,
  
  // Unused imports (basic detection)
  unusedImports: /^import\s+(?:type\s+)?{[^}]*}\s+from\s+['"'][^'"]+['"'];?\s*$/gm,
};

export const OptimizationConfig = {
  // Files that should be excluded from cleanup
  excludePatterns: [
    '**/*.test.tsx',
    '**/*.test.ts', 
    '**/*.spec.tsx',
    '**/*.spec.ts',
    '**/test/**',
    '**/tests/**',
    '**/__tests__/**',
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ],
  
  // Critical files that need special handling
  criticalFiles: [
    'src/main.tsx',
    'src/App.tsx',
    'src/index.css',
    'tailwind.config.ts',
    'vite.config.ts'
  ],
  
  // Bundle optimization targets
  bundleOptimization: {
    // Components that should be lazy-loaded
    lazyLoadCandidates: [
      'CustomerEngagementDetail',
      'EngagementHistory', 
      'URLScraper',
      'MoodleConfiguration',
      'AgentManagement'
    ],
    
    // Large dependencies that could be code-split
    heavyDependencies: [
      'recharts',
      'date-fns',
      '@tanstack/react-query'
    ],
    
    // Routes that should be code-split
    routeSplitCandidates: [
      '/admin/engagement-history',
      '/admin/content/url-scraper',
      '/admin/settings/moodle',
      '/admin/settings/agent-management'
    ]
  }
};

export class CodeCleanupAnalyzer {
  private issues: string[] = [];
  
  // Analyze a file for cleanup opportunities
  analyzeFile(filePath: string, content: string): CleanupAnalysis {
    const analysis: CleanupAnalysis = {
      filePath,
      issues: [],
      optimizations: [],
      suggestions: []
    };
    
    // Check for development console statements
    const consoleMatches = content.match(CleanupPatterns.devConsoleStatements);
    if (consoleMatches) {
      analysis.issues.push(`Found ${consoleMatches.length} console statements`);
    }
    
    // Check for any types
    const anyMatches = content.match(CleanupPatterns.anyTypes);
    if (anyMatches) {
      analysis.issues.push(`Found ${anyMatches.length} 'any' type usages`);
    }
    
    // Check for unnecessary React imports
    const reactImportMatches = content.match(CleanupPatterns.unnecessaryReactImports);
    if (reactImportMatches) {
      analysis.optimizations.push('Can remove unnecessary React import');
    }
    
    // Check if file is a candidate for lazy loading
    if (this.isLazyLoadCandidate(filePath)) {
      analysis.suggestions.push('Consider lazy loading this component');
    }
    
    return analysis;
  }
  
  private isLazyLoadCandidate(filePath: string): boolean {
    return OptimizationConfig.bundleOptimization.lazyLoadCandidates.some(
      candidate => filePath.includes(candidate)
    );
  }
  
  // Generate cleanup suggestions for the entire codebase
  generateCleanupPlan(): CleanupPlan {
    return {
      phase1: {
        name: 'Development Cleanup',
        priority: 'HIGH',
        tasks: [
          'Remove console.log statements from production code',
          'Replace any/any[] types with specific types',
          'Clean up development comments and debug code'
        ]
      },
      phase2: {
        name: 'React Modernization', 
        priority: 'MEDIUM',
        tasks: [
          'Remove unnecessary React imports',
          'Optimize component imports',
          'Fix timer cleanup in useEffect hooks'
        ]
      },
      phase3: {
        name: 'Bundle Optimization',
        priority: 'LOW',
        tasks: [
          'Implement code splitting for heavy routes',
          'Add lazy loading for large components',
          'Optimize dependency imports'
        ]
      }
    };
  }
}

export interface CleanupAnalysis {
  filePath: string;
  issues: string[];
  optimizations: string[];
  suggestions: string[];
}

export interface CleanupPhase {
  name: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  tasks: string[];
}

export interface CleanupPlan {
  phase1: CleanupPhase;
  phase2: CleanupPhase;
  phase3: CleanupPhase;
}

// Bundle analysis utilities
export class BundleAnalyzer {
  // Estimate component size impact
  static estimateComponentSize(componentPath: string): 'SMALL' | 'MEDIUM' | 'LARGE' {
    if (componentPath.includes('admin/') && 
        (componentPath.includes('Dashboard') || componentPath.includes('History'))) {
      return 'LARGE';
    }
    
    if (componentPath.includes('settings/') || componentPath.includes('content/')) {
      return 'MEDIUM';
    }
    
    return 'SMALL';
  }
  
  // Check if route should be code-split
  static shouldCodeSplit(routePath: string): boolean {
    return OptimizationConfig.bundleOptimization.routeSplitCandidates.includes(routePath);
  }
  
  // Analyze dependency usage
  static analyzeDependencyUsage(content: string): string[] {
    const heavyDeps = OptimizationConfig.bundleOptimization.heavyDependencies;
    return heavyDeps.filter(dep => content.includes(dep));
  }
}

// Performance optimization helpers
export const PerformanceOptimizers = {
  // Create optimized memo component
  createMemoComponent: (componentName: string) => `
import { memo } from 'react';

// ... component implementation

export const Memoized${componentName} = memo(${componentName});
`,
  
  // Create lazy-loaded component
  createLazyComponent: (componentPath: string) => `
import { lazy } from 'react';

const ${componentPath.split('/').pop()?.replace('.tsx', '')} = lazy(() => import('${componentPath}'));

export default ${componentPath.split('/').pop()?.replace('.tsx', '')};
`,
  
  // Create preload function
  createPreloader: (componentPath: string) => `
export const preload${componentPath.split('/').pop()?.replace('.tsx', '')} = () => {
  import('${componentPath}');
};
`
};

// Export cleanup analyzer instance
export const cleanupAnalyzer = new CodeCleanupAnalyzer();