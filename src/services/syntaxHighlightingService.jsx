import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

class SyntaxHighlightingService {
  constructor() {
    this.languages = {
      'javascript': 'javascript',
      'js': 'javascript',
      'typescript': 'typescript',
      'ts': 'typescript',
      'python': 'python',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'csharp': 'csharp',
      'cs': 'csharp',
      'php': 'php',
      'ruby': 'ruby',
      'rb': 'ruby',
      'go': 'go',
      'rust': 'rust',
      'rs': 'rust',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'xml': 'xml',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'sql': 'sql',
      'bash': 'bash',
      'sh': 'bash',
      'powershell': 'powershell',
      'ps1': 'powershell',
      'dockerfile': 'dockerfile',
      'markdown': 'markdown',
      'md': 'markdown',
      'diff': 'diff',
      'git': 'git',
      'vim': 'vim',
      'lua': 'lua',
      'perl': 'perl',
      'pl': 'perl',
      'r': 'r',
      'matlab': 'matlab',
      'octave': 'octave',
      'shell': 'bash',
      'zsh': 'bash',
      'fish': 'bash',
      'batch': 'batch',
      'cmd': 'batch',
      'ini': 'ini',
      'toml': 'toml',
      'nginx': 'nginx',
      'apache': 'apache',
      'htaccess': 'apache',
      'nginxconf': 'nginx',
      'conf': 'nginx',
      'log': 'log',
      'txt': 'text',
      'text': 'text',
      'plain': 'text'
    };

    this.themes = {
      light: tomorrow,
      dark: vscDarkPlus
    };
  }

  /**
   * Detect programming language from content
   * @param {string} content - Code content
   * @param {string} filename - Optional filename for detection
   * @returns {string} - Detected language
   */
  detectLanguage(content, filename = '') {
    // First check filename extension
    if (filename) {
      const ext = filename.split('.').pop()?.toLowerCase();
      if (ext && this.languages[ext]) {
        return this.languages[ext];
      }
    }

    // Check for shebang
    const shebangMatch = content.match(/^#!.*\/(\w+)/);
    if (shebangMatch) {
      const lang = shebangMatch[1].toLowerCase();
      if (this.languages[lang]) {
        return this.languages[lang];
      }
    }

    // Check for language-specific patterns
    const patterns = {
      javascript: [
        /function\s+\w+\s*\(/,
        /const\s+\w+\s*=/,
        /let\s+\w+\s*=/,
        /var\s+\w+\s*=/,
        /=>\s*/,
        /console\.log/,
        /require\s*\(/,
        /import\s+.*\s+from/,
        /export\s+/
      ],
      python: [
        /def\s+\w+\s*\(/,
        /import\s+\w+/,
        /from\s+\w+\s+import/,
        /if\s+__name__\s*==\s*['"]__main__['"]/,
        /print\s*\(/,
        /class\s+\w+/,
        /lambda\s+/,
        /yield\s+/
      ],
      java: [
        /public\s+class\s+\w+/,
        /private\s+\w+\s+\w+/,
        /public\s+static\s+void\s+main/,
        /System\.out\.print/,
        /import\s+java\./,
        /@Override/,
        /extends\s+\w+/,
        /implements\s+\w+/
      ],
      html: [
        /<!DOCTYPE\s+html>/i,
        /<html[^>]*>/i,
        /<head[^>]*>/i,
        /<body[^>]*>/i,
        /<div[^>]*>/i,
        /<span[^>]*>/i,
        /<p[^>]*>/i,
        /<a[^>]*>/i
      ],
      css: [
        /\.[\w-]+\s*{/,
        /#[\w-]+\s*{/,
        /@media\s+/,
        /@keyframes\s+/,
        /@import\s+/,
        /:\s*(hover|focus|active|visited)/,
        /margin:\s*\d+px/,
        /padding:\s*\d+px/
      ],
      sql: [
        /SELECT\s+.*\s+FROM/i,
        /INSERT\s+INTO/i,
        /UPDATE\s+.*\s+SET/i,
        /DELETE\s+FROM/i,
        /CREATE\s+TABLE/i,
        /ALTER\s+TABLE/i,
        /DROP\s+TABLE/i,
        /WHERE\s+.*\s*=/i
      ],
      json: [
        /^\s*{[\s\S]*}\s*$/,
        /^\s*\[[\s\S]*\]\s*$/,
        /"[^"]*"\s*:\s*"[^"]*"/,
        /"[^"]*"\s*:\s*\d+/,
        /"[^"]*"\s*:\s*(true|false|null)/
      ],
      markdown: [
        /^#{1,6}\s+/m,
        /^\*\s+/m,
        /^\d+\.\s+/m,
        /\[.*\]\(.*\)/,
        /```[\s\S]*```/,
        /`[^`]+`/,
        /^\>\s+/m,
        /^---$/m
      ]
    };

    for (const [lang, langPatterns] of Object.entries(patterns)) {
      const matchCount = langPatterns.reduce((count, pattern) => {
        return count + (pattern.test(content) ? 1 : 0);
      }, 0);
      
      if (matchCount >= 2) {
        return lang;
      }
    }

    // Default to text if no language detected
    return 'text';
  }

  /**
   * Get syntax highlighter component
   * @param {string} language - Programming language
   * @param {string} theme - Theme (light/dark)
   * @param {object} customStyle - Custom styles
   * @returns {React.Component} - Syntax highlighter component
   */
  getHighlighter(language = 'text', theme = 'dark', customStyle = {}) {
    const defaultStyle = {
      borderRadius: '8px',
      padding: '16px',
      fontSize: '14px',
      lineHeight: '1.5',
      ...customStyle
    };

    return (
      <SyntaxHighlighter
        language={language}
        style={this.themes[theme]}
        customStyle={defaultStyle}
        showLineNumbers={true}
        wrapLines={true}
        wrapLongLines={true}
        lineNumberStyle={{
          minWidth: '3em',
          paddingRight: '1em',
          color: '#666',
          userSelect: 'none'
        }}
      />
    );
  }

  /**
   * Get available languages
   * @returns {Array} - List of supported languages
   */
  getAvailableLanguages() {
    return Object.keys(this.languages).sort();
  }

  /**
   * Get language display name
   * @param {string} language - Language key
   * @returns {string} - Display name
   */
  getLanguageDisplayName(language) {
    const displayNames = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'scala': 'Scala',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'less': 'Less',
      'json': 'JSON',
      'yaml': 'YAML',
      'sql': 'SQL',
      'bash': 'Bash',
      'powershell': 'PowerShell',
      'dockerfile': 'Dockerfile',
      'markdown': 'Markdown',
      'diff': 'Diff',
      'git': 'Git',
      'vim': 'Vim',
      'lua': 'Lua',
      'perl': 'Perl',
      'r': 'R',
      'matlab': 'MATLAB',
      'octave': 'Octave',
      'shell': 'Shell',
      'batch': 'Batch',
      'ini': 'INI',
      'toml': 'TOML',
      'nginx': 'Nginx',
      'apache': 'Apache',
      'log': 'Log',
      'text': 'Plain Text'
    };

    return displayNames[language] || language;
  }

  /**
   * Copy line numbers to clipboard
   * @param {string} content - Code content
   * @param {number} startLine - Start line number
   * @param {number} endLine - End line number
   * @returns {string} - Selected lines
   */
  copyLines(content, startLine, endLine) {
    const lines = content.split('\n');
    const selectedLines = lines.slice(startLine - 1, endLine);
    return selectedLines.join('\n');
  }

  /**
   * Highlight specific lines
   * @param {Array} lines - Line numbers to highlight
   * @returns {object} - Line highlighting style
   */
  highlightLines(lines) {
    const style = {};
    lines.forEach(line => {
      style[line] = {
        backgroundColor: 'rgba(255, 255, 0, 0.2)',
        borderLeft: '3px solid #ffd700'
      };
    });
    return style;
  }
}

export default new SyntaxHighlightingService();
