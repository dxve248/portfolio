// Minimal flat ESLint config for the hand-written browser scripts.
// Focuses on genuine bugs (undefined globals, unreachable/duplicate code)
// rather than stylistic preferences.
const browserGlobals = {
    window: 'readonly', document: 'readonly', navigator: 'readonly',
    localStorage: 'readonly', location: 'readonly', history: 'readonly',
    requestAnimationFrame: 'readonly', cancelAnimationFrame: 'readonly',
    requestIdleCallback: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly',
    setInterval: 'readonly', clearInterval: 'readonly', console: 'readonly',
    performance: 'readonly', getComputedStyle: 'readonly', matchMedia: 'readonly',
    IntersectionObserver: 'readonly', ResizeObserver: 'readonly', MutationObserver: 'readonly',
    WebGLRenderingContext: 'readonly', Image: 'readonly', fetch: 'readonly',
    URL: 'readonly', URLSearchParams: 'readonly', TextEncoder: 'readonly',
    Blob: 'readonly', CustomEvent: 'readonly', Event: 'readonly',
    HTMLElement: 'readonly', Element: 'readonly', Node: 'readonly',
    DOMRect: 'readonly', devicePixelRatio: 'readonly'
};

export default [
    {
        files: ['main.js', 'assets/hero-mesh.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: browserGlobals
        },
        rules: {
            'no-undef': 'error',
            'no-redeclare': 'error',
            'no-dupe-keys': 'error',
            'no-dupe-args': 'error',
            'no-duplicate-case': 'error',
            'no-cond-assign': 'error',
            'no-unreachable': 'error',
            'no-unsafe-negation': 'error',
            'valid-typeof': 'error',
            'no-unused-vars': 'off',
            'no-empty': 'off'
        }
    }
];
