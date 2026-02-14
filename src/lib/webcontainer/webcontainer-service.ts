import { WebContainer } from '@webcontainer/api';

export interface FileSystemTree {
  [key: string]: {
    file?: {
      contents: string;
    };
    directory?: FileSystemTree;
  };
}

class WebContainerService {
  private instance: WebContainer | null = null;
  private bootPromise: Promise<void> | null = null;
  private serverReadyCallbacks: ((url: string) => void)[] = [];
  private previewUrl: string | null = null;

  async boot(): Promise<void> {
    if (this.instance) return;
    if (this.bootPromise) return this.bootPromise;

    this.bootPromise = (async () => {
      try {
        this.instance = await WebContainer.boot();
        
        this.instance.on('server-ready', (_port: number, url: string) => {
          console.log('Server ready:', url);
          this.previewUrl = url;
          this.serverReadyCallbacks.forEach(cb => cb(url));
        });

        console.log('WebContainer booted successfully');
      } catch (error) {
        console.error('Failed to boot WebContainer:', error);
        this.bootPromise = null;
        throw error;
      }
    })();

    return this.bootPromise;
  }

  async mount(files: FileSystemTree): Promise<void> {
    if (!this.instance) {
      await this.boot();
    }
    await this.instance!.mount(files);
  }

  async spawn(
    command: string, 
    args: string[] = [], 
    options: { 
      cwd?: string;
      env?: Record<string, string>;
      onOutput?: (data: string) => void;
    } = {}
  ) {
    if (!this.instance) {
      await this.boot();
    }

    const process = await this.instance!.spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
    });

    if (options.onOutput) {
      const reader = process.output.getReader();
      const decoder = new TextDecoder();
      
      const readOutput = async () => {
        try {
          while (true) {
            const result = await reader.read();
            if (result.done) break;
            const text = decoder.decode(result.value, { stream: true });
            options.onOutput?.(text);
          }
        } catch (error) {
          console.error('Error reading process output:', error);
        }
      };
      
      readOutput();
    }

    return process;
  }

  async runCommand(
    command: string, 
    onOutput?: (data: string) => void
  ): Promise<{ exitCode: number; output: string }> {
    let output = '';
    
    const process = await this.spawn('sh', ['-c', command], {
      onOutput: (data) => {
        output += data;
        onOutput?.(data);
      }
    });

    const exitCode = await process.exit;
    return { exitCode, output };
  }

  onServerReady(callback: (url: string) => void): void {
    this.serverReadyCallbacks.push(callback);
  }

  async readFile(path: string): Promise<string> {
    if (!this.instance) {
      await this.boot();
    }
    const content = await this.instance!.fs.readFile(path);
    return new TextDecoder().decode(content);
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.instance) {
      await this.boot();
    }
    await this.instance!.fs.writeFile(path, new TextEncoder().encode(content));
  }

  async mkdir(path: string): Promise<void> {
    if (!this.instance) {
      await this.boot();
    }
    await this.instance!.fs.mkdir(path, { recursive: true });
  }

  async rm(path: string, options?: { recursive?: boolean }): Promise<void> {
    if (!this.instance) {
      await this.boot();
    }
    await this.instance!.fs.rm(path, options);
  }

  async getFileTree(dirPath: string = '/'): Promise<FileSystemTree> {
    if (!this.instance) {
      await this.boot();
    }

    const tree: FileSystemTree = {};
    
    try {
      const entries = await this.instance!.fs.readdir(dirPath);
      
      for (const entry of entries) {
        const fullPath = `${dirPath}/${entry.name}`.replace(/\/+/g, '/');
        
        if (entry.isDirectory()) {
          tree[entry.name] = {
            directory: await this.getFileTree(fullPath)
          };
        } else {
          try {
            const content = await this.instance!.fs.readFile(fullPath);
            const text = new TextDecoder().decode(content);
            tree[entry.name] = {
              file: { contents: text }
            };
          } catch {
            tree[entry.name] = {
              file: { contents: '' }
            };
          }
        }
      }
    } catch (error) {
      console.error('Error reading directory:', dirPath, error);
    }
    
    return tree;
  }

  async installDependencies(
    onOutput?: (data: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { exitCode, output } = await this.runCommand('npm install', onOutput);
      
      if (exitCode !== 0) {
        return { success: false, error: output };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Installation failed' 
      };
    }
  }

  async runDevServer(
    onOutput?: (data: string) => void
  ): Promise<{ url?: string; error?: string }> {
    return new Promise((resolve) => {
      this.onServerReady((url) => {
        resolve({ url });
      });

      this.runCommand('npm run dev', (data) => {
        onOutput?.(data);
      }).then(({ exitCode, output }) => {
        if (exitCode !== 0) {
          resolve({ error: output });
        }
      }).catch((error) => {
        resolve({ error: error instanceof Error ? error.message : 'Failed to start dev server' });
      });
    });
  }

  async build(
    onOutput?: (data: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { exitCode, output } = await this.runCommand('npm run build', onOutput);
      
      if (exitCode !== 0) {
        return { success: false, error: output };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Build failed' 
      };
    }
  }

  getInstance(): WebContainer | null {
    return this.instance;
  }

  isBooted(): boolean {
    return this.instance !== null;
  }

  getPreviewUrl(): string | null {
    return this.previewUrl;
  }

  async initNextJSProject(): Promise<void> {
    const nextjsFiles: FileSystemTree = {
      'package.json': {
        file: {
          contents: JSON.stringify({
            name: 'my-app',
            version: '0.1.0',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
              lint: 'next lint'
            },
            dependencies: {
              next: 'latest',
              react: 'latest',
              'react-dom': 'latest'
            },
            devDependencies: {
              '@types/node': 'latest',
              '@types/react': 'latest',
              '@types/react-dom': 'latest',
              typescript: 'latest'
            }
          }, null, 2)
        }
      },
      'next.config.js': {
        file: {
          contents: `/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig`
        }
      },
      'tsconfig.json': {
        file: {
          contents: JSON.stringify({
            compilerOptions: {
              target: 'es5',
              lib: ['dom', 'dom.iterable', 'esnext'],
              allowJs: true,
              skipLibCheck: true,
              strict: true,
              forceConsistentCasingInFileNames: true,
              noEmit: true,
              esModuleInterop: true,
              module: 'esnext',
              moduleResolution: 'bundler',
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: 'preserve',
              incremental: true,
              plugins: [{ name: 'next' }],
              paths: { '@/*': ['./src/*'] }
            },
            include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
            exclude: ['node_modules']
          }, null, 2)
        }
      },
      'src': {
        directory: {
          'app': {
            directory: {
              'page.tsx': {
                file: {
                  contents: `export default function Home() {
  return (
    <main style={{ minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Welcome to Next.js</h1>
      <p style={{ marginTop: '1rem' }}>Start building amazing things...</p>
    </main>
  );
}`
                }
              },
              'layout.tsx': {
                file: {
                  contents: `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My App',
  description: 'Created with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
                }
              }
            }
          }
        }
      }
    };

    await this.mount(nextjsFiles);
  }

  async initReactProject(): Promise<void> {
    const reactFiles: FileSystemTree = {
      'package.json': {
        file: {
          contents: JSON.stringify({
            name: 'my-react-app',
            version: '0.1.0',
            private: true,
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview'
            },
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0'
            },
            devDependencies: {
              '@types/react': '^18.2.0',
              '@types/react-dom': '^18.2.0',
              '@vitejs/plugin-react': '^4.2.0',
              typescript: '^5.0.0',
              vite: '^5.0.0'
            }
          }, null, 2)
        }
      },
      'vite.config.ts': {
        file: {
          contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
        }
      },
      'tsconfig.json': {
        file: {
          contents: JSON.stringify({
            compilerOptions: {
              target: 'ES2020',
              useDefineForClassFields: true,
              lib: ['ES2020', 'DOM', 'DOM.Iterable'],
              module: 'ESNext',
              skipLibCheck: true,
              moduleResolution: 'bundler',
              allowImportingTsExtensions: true,
              resolveJsonModule: true,
              isolatedModules: true,
              noEmit: true,
              jsx: 'react-jsx',
              strict: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              noFallthroughCasesInSwitch: true
            },
            include: ['src'],
            references: [{ path: './tsconfig.node.json' }]
          }, null, 2)
        }
      },
      'index.html': {
        file: {
          contents: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
        }
      },
      'src': {
        directory: {
          'main.tsx': {
            file: {
              contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
            }
          },
          'App.tsx': {
            file: {
              contents: `function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Welcome to React</h1>
      <p>Start building amazing things!</p>
    </div>
  )
}

export default App`
            }
          }
        }
      }
    };

    await this.mount(reactFiles);
  }
}

export const webContainerService = new WebContainerService();
export default webContainerService;
