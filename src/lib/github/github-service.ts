import { getAIModelRouter, ModelType } from '@/lib/ai/model-router';

export interface GitHubConnection {
  id: string;
  userId: string;
  accessToken: string;
  githubId: string;
  githubUsername: string;
}

export interface GitHubRepo {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  lastSyncedAt: Date;
}

export interface GitHubFile {
  path: string;
  content: string;
  sha: string;
}

class GitHubService {
  private baseUrl = 'https://api.github.com';

  async connect(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to connect' };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async getRepositories(accessToken: string): Promise<{ 
    success: boolean; 
    repos?: GitHubRepo[]; 
    error?: string 
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/user/repos`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      
      const repos: GitHubRepo[] = data.map((repo: any) => ({
        id: repo.id.toString(),
        owner: repo.owner.login,
        name: repo.name,
        fullName: repo.full_name,
        defaultBranch: repo.default_branch,
        lastSyncedAt: new Date(),
      }));

      return { success: true, repos };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch repositories',
      };
    }
  }

  async cloneRepository(
    accessToken: string,
    owner: string,
    repo: string,
    branch?: string
  ): Promise<{ success: boolean; files?: any; error?: string }> {
    try {
      const ref = branch || 'main';
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch repository tree');
      }

      const data = await response.json();
      const files: Record<string, string> = {};

      for (const item of data.tree) {
        if (item.type === 'blob') {
          try {
            const contentResponse = await fetch(item.url, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            });

            if (contentResponse.ok) {
              const contentData = await contentResponse.json();
              files[item.path] = Buffer.from(contentData.content, 'base64').toString();
            }
          } catch (error) {
            console.error(`Failed to fetch file ${item.path}:`, error);
          }
        }
      }

      return { success: true, files };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clone repository',
      };
    }
  }

  async pushChanges(
    accessToken: string,
    owner: string,
    repo: string,
    files: Array<{ path: string; content: string }>,
    message: string,
    branch?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const currentBranch = branch || 'main';
      
      const commitResponse = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/git/commits`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            tree: files.map(file => ({
              path: file.path,
              mode: '100644',
              type: 'blob',
              content: file.content,
            })),
          }),
        }
      );

      if (!commitResponse.ok) {
        throw new Error('Failed to create commit');
      }

      const commitData = await commitResponse.json();

      const updateRefResponse = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/git/refs/heads/${currentBranch}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sha: commitData.sha,
          }),
        }
      );

      if (!updateRefResponse.ok) {
        throw new Error('Failed to update branch reference');
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to push changes',
      };
    }
  }

  async createPullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    title: string,
    body: string,
    headBranch: string,
    baseBranch: string = 'main'
  ): Promise<{ success: boolean; prUrl?: string; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/pulls`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            body,
            head: headBranch,
            base: baseBranch,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create pull request');
      }

      const data = await response.json();
      return { success: true, prUrl: data.html_url };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create PR',
      };
    }
  }

  getOAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/github/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      scope: 'repo,user',
      state: this.generateState(),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

export const githubService = new GitHubService();
export default githubService;
