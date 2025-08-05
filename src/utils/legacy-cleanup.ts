/**
 * Legacy code cleanup utilities
 * Identifies and helps remove outdated patterns and unused code
 */

// Legacy patterns that should be updated or removed
export const LegacyPatterns = {
  // Old React patterns
  classComponents: /class\s+\w+\s+extends\s+React\.Component/g,
  reactCreateClass: /React\.createClass\(/g,
  
  // Deprecated prop-types usage
  propTypes: /\.propTypes\s*=/g,
  
  // Old state management patterns
  legacyStateUpdates: /this\.setState\(/g,
  
  // Outdated imports
  legacyImports: [
    'react-router', // Should be react-router-dom
    'prop-types', // Not needed with TypeScript
    'classnames', // Use clsx instead
  ],
  
  // Old naming conventions
  oldNamingPatterns: {
    componentNames: /Component$/g, // Redundant "Component" suffix
    hookNames: /^use\w+Hook$/g, // Redundant "Hook" suffix
    typeNames: /Interface$/g, // Redundant "Interface" suffix
  },
  
  // Deprecated browser APIs
  deprecatedAPIs: [
    'document.write',
    'escape(',
    'unescape(',
    'String.prototype.substr'
  ]
};

export const ModernizationSuggestions = {
  // React modernization
  replaceClassComponent: (componentName: string) => `
// Replace class component with functional component + hooks
import { useState, useEffect } from 'react';

export function ${componentName}() {
  // Use hooks instead of class methods
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    // Replace componentDidMount, componentDidUpdate, etc.
  }, []);
  
  return (
    // JSX here
  );
}
`,

  // State management modernization
  replaceRedux: (storeName: string) => `
// Consider replacing Redux with Zustand or React Query for simpler state management
import { create } from 'zustand';

interface ${storeName}State {
  // Define state shape
}

export const use${storeName} = create<${storeName}State>((set, get) => ({
  // State and actions
}));
`,

  // API modernization
  modernizeAPI: () => `
// Replace axios/fetch with React Query for better caching and state management
import { useQuery, useMutation } from '@tanstack/react-query';

export function useApiData() {
  return useQuery({
    queryKey: ['api-data'],
    queryFn: () => apiClient.getData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
`
};

// File patterns that suggest legacy code
export const LegacyFilePatterns = {
  // Files that often contain legacy patterns
  legacyFileNames: [
    /\.container\./,
    /\.hoc\./,
    /\.withRouter\./,
    /\.connect\./,
    /\.actions\./,
    /\.reducers\./,
    /\.saga\./
  ],
  
  // Directory structures that suggest legacy patterns
  legacyDirectories: [
    'actions/',
    'reducers/',
    'sagas/',
    'containers/',
    'hocs/',
    'connectors/'
  ]
};

export class LegacyCodeDetector {
  // Detect legacy patterns in code
  static detectLegacyPatterns(content: string, filePath: string): LegacyDetectionResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check for class components
    if (LegacyPatterns.classComponents.test(content)) {
      issues.push('Uses class component - consider converting to functional component');
      suggestions.push('Convert to functional component with hooks');
    }
    
    // Check for prop-types (redundant with TypeScript)
    if (LegacyPatterns.propTypes.test(content)) {
      issues.push('Uses prop-types - redundant with TypeScript');
      suggestions.push('Remove prop-types and rely on TypeScript interfaces');
    }
    
    // Check for legacy imports
    for (const legacyImport of LegacyPatterns.legacyImports) {
      if (content.includes(legacyImport)) {
        issues.push(`Uses legacy import: ${legacyImport}`);
        suggestions.push(`Update import to modern alternative`);
      }
    }
    
    // Check for deprecated APIs
    for (const deprecatedAPI of LegacyPatterns.deprecatedAPIs) {
      if (content.includes(deprecatedAPI)) {
        issues.push(`Uses deprecated API: ${deprecatedAPI}`);
        suggestions.push(`Replace with modern alternative`);
      }
    }
    
    // Check file name patterns
    for (const pattern of LegacyFilePatterns.legacyFileNames) {
      if (pattern.test(filePath)) {
        suggestions.push('File name suggests legacy pattern - consider refactoring');
      }
    }
    
    return {
      filePath,
      legacyIssues: issues,
      modernizationSuggestions: suggestions,
      priority: this.calculatePriority(issues)
    };
  }
  
  private static calculatePriority(issues: string[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (issues.some(issue => issue.includes('class component') || issue.includes('deprecated'))) {
      return 'HIGH';
    }
    if (issues.some(issue => issue.includes('prop-types') || issue.includes('legacy import'))) {
      return 'MEDIUM';
    }
    return 'LOW';
  }
  
  // Generate modernization plan
  static generateModernizationPlan(detectionResults: LegacyDetectionResult[]): ModernizationPlan {
    const highPriority = detectionResults.filter(r => r.priority === 'HIGH');
    const mediumPriority = detectionResults.filter(r => r.priority === 'MEDIUM');
    const lowPriority = detectionResults.filter(r => r.priority === 'LOW');
    
    return {
      summary: {
        totalFiles: detectionResults.length,
        highPriorityFiles: highPriority.length,
        mediumPriorityFiles: mediumPriority.length,
        lowPriorityFiles: lowPriority.length
      },
      recommendations: [
        'Convert class components to functional components',
        'Remove prop-types in favor of TypeScript',
        'Update legacy imports to modern alternatives',
        'Replace deprecated APIs',
        'Refactor legacy file structures'
      ],
      phases: {
        immediate: highPriority.map(r => r.filePath),
        shortTerm: mediumPriority.map(r => r.filePath),
        longTerm: lowPriority.map(r => r.filePath)
      }
    };
  }
}

export interface LegacyDetectionResult {
  filePath: string;
  legacyIssues: string[];
  modernizationSuggestions: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ModernizationPlan {
  summary: {
    totalFiles: number;
    highPriorityFiles: number;
    mediumPriorityFiles: number;
    lowPriorityFiles: number;
  };
  recommendations: string[];
  phases: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

// Dead code detection utilities
export class DeadCodeDetector {
  // Common patterns of potentially dead code
  static deadCodePatterns = {
    unusedImports: /^import\s+.*\s+from\s+['"][^'"]+['"];?\s*$/gm,
    unusedVariables: /^(?:const|let|var)\s+\w+\s*=/gm,
    unreachableCode: /return.*;[\s\S]*?(?=\n\s*}|\n\s*$)/gm,
    emptyFunctions: /function\s+\w+\s*\([^)]*\)\s*{\s*}/gm,
    emptyComponents: /export\s+function\s+\w+\s*\([^)]*\)\s*{\s*return\s+null;\s*}/gm
  };
  
  // Detect potentially unused code
  static detectDeadCode(content: string, filePath: string): DeadCodeAnalysis {
    const potentialIssues: string[] = [];
    
    // Check for empty functions
    const emptyFunctions = content.match(this.deadCodePatterns.emptyFunctions);
    if (emptyFunctions) {
      potentialIssues.push(`Found ${emptyFunctions.length} empty functions`);
    }
    
    // Check for empty components that just return null
    const emptyComponents = content.match(this.deadCodePatterns.emptyComponents);
    if (emptyComponents) {
      potentialIssues.push(`Found ${emptyComponents.length} empty components`);
    }
    
    return {
      filePath,
      potentialDeadCode: potentialIssues,
      confidence: this.calculateConfidence(potentialIssues),
      recommendations: this.generateRecommendations(potentialIssues)
    };
  }
  
  private static calculateConfidence(issues: string[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (issues.length >= 3) return 'HIGH';
    if (issues.length >= 1) return 'MEDIUM';
    return 'LOW';
  }
  
  private static generateRecommendations(issues: string[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(issue => issue.includes('empty functions'))) {
      recommendations.push('Remove or implement empty functions');
    }
    
    if (issues.some(issue => issue.includes('empty components'))) {
      recommendations.push('Remove components that only return null or implement proper fallback UI');
    }
    
    return recommendations;
  }
}

export interface DeadCodeAnalysis {
  filePath: string;
  potentialDeadCode: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendations: string[];
}