'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Package, Download, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useVFSStore } from '@/store/useVFSStore';
import { webContainerService } from '@/lib/webcontainer/webcontainer-service';

interface NpmPackage {
  name: string;
  version: string;
  description: string;
  downloads?: number;
  keywords?: string[];
}

interface InstalledPackage {
  name: string;
  version: string;
  isDev?: boolean;
}

const PackageManager: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NpmPackage[]>([]);
  const [installedPackages, setInstalledPackages] = useState<InstalledPackage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { appendTerminalOutput } = useVFSStore();

  const searchNpm = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10`);
      const data = await response.json();
      
      const packages = data.objects.map((obj: any) => ({
        name: obj.package.name,
        version: obj.package.version,
        description: obj.package.description || 'No description',
        downloads: obj.downloads?.monthly,
        keywords: obj.package.keywords,
      }));
      
      setSearchResults(packages);
    } catch (err) {
      setError('Failed to search npm registry');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const loadInstalledPackages = useCallback(async () => {
    try {
      const packageJsonContent = await webContainerService.readFile('package.json');
      const packageJson = JSON.parse(packageJsonContent);
      
      const installed: InstalledPackage[] = [];
      
      if (packageJson.dependencies) {
        Object.entries(packageJson.dependencies).forEach(([name, version]) => {
          installed.push({ name, version: version as string, isDev: false });
        });
      }
      
      if (packageJson.devDependencies) {
        Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
          installed.push({ name, version: version as string, isDev: true });
        });
      }
      
      setInstalledPackages(installed);
    } catch {
      console.log('No package.json found');
    }
  }, []);

  useEffect(() => {
    loadInstalledPackages();
  }, [loadInstalledPackages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchNpm(searchQuery);
  };

  const installPackage = async (packageName: string, isDev = false) => {
    setIsInstalling(true);
    setError(null);
    
    try {
      const { installDependencies } = useVFSStore.getState();
      
      const cmd = isDev 
        ? `npm install --save-dev ${packageName}` 
        : `npm install ${packageName}`;
      
      appendTerminalOutput(`$ ${cmd}\n`);
      
      const process = await webContainerService.spawn('npm', ['install', isDev ? '--save-dev' : '--save', packageName], {
        onOutput: (data) => {
          appendTerminalOutput(data);
        }
      });
      
      const exitCode = await process.exit;
      
      if (exitCode === 0) {
        await loadInstalledPackages();
        setError(null);
      } else {
        setError(`Failed to install ${packageName}`);
      }
    } catch (err) {
      setError(`Error installing ${packageName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const uninstallPackage = async (packageName: string) => {
    setIsInstalling(true);
    setError(null);
    
    try {
      const cmd = `npm uninstall ${packageName}`;
      appendTerminalOutput(`$ ${cmd}\n`);
      
      const process = await webContainerService.spawn('npm', ['uninstall', packageName], {
        onOutput: (data) => {
          appendTerminalOutput(data);
        }
      });
      
      const exitCode = await process.exit;
      
      if (exitCode === 0) {
        await loadInstalledPackages();
      } else {
        setError(`Failed to uninstall ${packageName}`);
      }
    } catch (err) {
      setError(`Error uninstalling ${packageName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const isInstalled = (packageName: string) => {
    return installedPackages.some(pkg => pkg.name === packageName);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Package Manager
        </h3>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search npm packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isSearching}>
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>

      {error && (
        <div className="mx-4 mt-2 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm rounded flex items-center gap-2">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 border-r border-gray-200 dark:border-gray-700">
          <div className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Search Results
          </div>
          <ScrollArea className="h-[calc(100%-40px)]">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {isSearching ? 'Searching...' : 'Search for packages above'}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {searchResults.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{pkg.name}</span>
                          <span className="text-xs text-gray-500">v{pkg.version}</span>
                          {isInstalled(pkg.name) && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Installed
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {pkg.description}
                        </p>
                        {pkg.downloads && (
                          <p className="text-xs text-gray-400 mt-1">
                            {pkg.downloads.toLocaleString()} monthly downloads
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={isInstalled(pkg.name) ? "secondary" : "default"}
                        disabled={isInstalling || isInstalled(pkg.name)}
                        onClick={() => installPackage(pkg.name)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex-1">
          <div className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Installed Packages
          </div>
          <ScrollArea className="h-[calc(100%-40px)]">
            {installedPackages.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No packages installed
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {installedPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{pkg.name}</span>
                        <span className="text-xs text-gray-500">{pkg.version}</span>
                      </div>
                      {pkg.isDev && (
                        <Badge variant="outline" className="text-xs mt-1">
                          dev
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isInstalling}
                      onClick={() => uninstallPackage(pkg.name)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default PackageManager;
