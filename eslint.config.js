// ESLint 9 flat config for React + TypeScript.
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', '*.config.js', '*.config.ts'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...jsxA11y.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // --- Reglas de capa (docs/standards/capas-arquitectura.md, ADR-004) ---
  //
  // Flujo de imports permitido:
  //   pages → features → components/ui → lib
  // Una feature se consume SIEMPRE por su `index.ts`; dentro de la propia
  // feature se usan rutas relativas. Sin estas reglas el mapa de capas es
  // honor system y vuelve a driftear.
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message:
                'Importá otra feature por su contrato público (`@/features/<feature>`); dentro de la propia feature usá rutas relativas.',
            },
            {
              group: ['@/pages/*', '@/layouts/*'],
              message: 'Una feature no puede importar de `pages/` ni `layouts/`.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/features/*/*', '@/pages/*', '@/layouts/*', '@/data/*'],
              message:
                '`components/ui/` es ciego al dominio: solo puede importar de `lib/` y `types/`.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/layout/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message: 'Importá la feature por su contrato público (`@/features/<feature>`).',
            },
            {
              group: ['@/pages/*', '@/layouts/*'],
              message: 'El chrome de layout no puede importar de `pages/` ni `layouts/`.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/pages/**/*.{ts,tsx}', 'src/layouts/**/*.{ts,tsx}', 'src/App.tsx'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message:
                'Importá la feature por su contrato público (`@/features/<feature>`), nunca por una ruta interna.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/hooks/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/features/*/*', '@/pages/*', '@/layouts/*', '@/data/*'],
              message:
                '`hooks/` son hooks genéricos, ciegos al dominio: solo pueden importar de `lib/` y `types/`. Un hook que conoce una feature vive dentro de esa feature.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*'],
              message: '`lib/` es utilidades puras: no importa de ninguna capa de la app.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/types/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/components/*', '@/pages/*', '@/layouts/*'],
              message: '`types/` son contratos compartidos: no dependen de ninguna capa.',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
