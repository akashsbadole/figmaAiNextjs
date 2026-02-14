export interface DeploymentConfig {
  provider: 'vercel' | 'netlify';
  projectId: string;
  buildCommand?: string;
  outputDirectory?: string;
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  deployId?: string;
  error?: string;
}

class DeploymentService {
  async deployToVercel(
    projectId: string,
    files: Array<{ path: string; content: string }>,
    options?: {
      buildCommand?: string;
      outputDirectory?: string;
      framework?: string;
    }
  ): Promise<DeploymentResult> {
    try {
      const response = await fetch('/api/deploy/vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          files,
          options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || 'Deployment failed',
        };
      }

      const data = await response.json();
      return {
        success: true,
        url: data.url,
        deployId: data.deployId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed',
      };
    }
  }

  async deployToNetlify(
    projectId: string,
    files: Array<{ path: string; content: string }>,
    options?: {
      buildCommand?: string;
      publishDirectory?: string;
    }
  ): Promise<DeploymentResult> {
    try {
      const response = await fetch('/api/deploy/netlify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          files,
          options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || 'Deployment failed',
        };
      }

      const data = await response.json();
      return {
        success: true,
        url: data.url,
        deployId: data.deployId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed',
      };
    }
  }

  async getDeploymentStatus(
    provider: 'vercel' | 'netlify',
    deployId: string
  ): Promise<{
    status: 'pending' | 'building' | 'ready' | 'error';
    url?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `/api/deploy/${provider}/status?deployId=${deployId}`
      );

      if (!response.ok) {
        throw new Error('Failed to get deployment status');
      }

      return await response.json();
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to get status',
      };
    }
  }

  async buildAndDeploy(
    projectId: string,
    provider: 'vercel' | 'netlify',
    onProgress?: (step: string, progress: number) => void
  ): Promise<DeploymentResult> {
    const webContainerService = (await import('@/lib/webcontainer/webcontainer-service')).default;

    onProgress?.('Building project...', 0);

    try {
      const buildResult = await webContainerService.build((output) => {
        onProgress?.('Building project...', 50);
      });

      if (!buildResult.success) {
        return {
          success: false,
          error: buildResult.error || 'Build failed',
        };
      }

      onProgress?.('Collecting files...', 70);

      const tree = await webContainerService.getFileTree('/dist');
      const files = this.flattenFileTree(tree, '/dist');

      onProgress?.('Deploying...', 90);

      let deployResult: DeploymentResult;
      if (provider === 'vercel') {
        deployResult = await this.deployToVercel(projectId, files);
      } else {
        deployResult = await this.deployToNetlify(projectId, files);
      }

      onProgress?.('Deployed!', 100);
      return deployResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed',
      };
    }
  }

  private flattenFileTree(
    tree: any,
    basePath: string = ''
  ): Array<{ path: string; content: string }> {
    const files: Array<{ path: string; content: string }> = [];

    for (const [name, node] of Object.entries(tree)) {
      const path = basePath ? `${basePath}/${name}` : name;

      if ((node as any).directory) {
        files.push(
          ...this.flattenFileTree((node as any).directory, path)
        );
      } else if ((node as any).file) {
        files.push({
          path: path.replace(/^\//, ''),
          content: (node as any).file.contents,
        });
      }
    }

    return files;
  }
}

export const deploymentService = new DeploymentService();
export default deploymentService;
