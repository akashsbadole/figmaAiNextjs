import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';

// ============================================
// Type Definitions
// ============================================

export interface DesignSystemColors {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  accent: Record<string, string>;
  neutral: Record<string, string>;
  success: Record<string, string>;
  warning: Record<string, string>;
  error: Record<string, string>;
}

export interface DesignSystemTypography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, string>;
  lineHeight: Record<string, string>;
  letterSpacing: Record<string, string>;
}

export interface DesignSystemSpacing {
  scale: number;
  values: Record<string, string>;
}

export interface DesignSystemBorderRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface DesignSystemShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface ButtonComponentStyles {
  background: string;
  color: string;
  border?: string;
}

export interface ButtonSizesStyles {
  padding: string;
  fontSize: string;
  height?: string;
}

export interface ButtonComponent {
  variants: Record<string, ButtonComponentStyles>;
  sizes: Record<string, ButtonSizesStyles>;
  borderRadius: string;
}

export interface CardTitleStyles {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
}

export interface CardDescriptionStyles {
  fontSize: string;
  color: string;
  lineHeight: string;
}

export interface CardHeaderStyles {
  padding: string;
}

export interface CardComponent {
  background: string;
  border: string;
  borderRadius: string;
  shadow: string;
  padding: string;
  header: CardHeaderStyles;
  title: CardTitleStyles;
  description: CardDescriptionStyles;
}

export interface InputFocusStyles {
  ring: string;
  border?: string;
}

export interface InputComponent {
  background: string;
  border: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  color: string;
  focus: InputFocusStyles;
}

export interface ModalOverlayStyles {
  background: string;
}

export interface ModalComponent {
  background: string;
  border: string;
  borderRadius: string;
  shadow: string;
  padding: string;
  overlay: ModalOverlayStyles;
}

export interface DesignSystemComponents {
  button: ButtonComponent;
  card: CardComponent;
  input: InputComponent;
  modal: ModalComponent;
}

// Advanced Options Types
export interface DesignPreferences {
  colorScheme?: string;
  designStyle?: string;
  targetPlatform?: string;
  accessibility?: string;
  brandPersonality?: string;
  componentStyle?: string;
  layoutSystem?: string;
  typographyScale?: string;
  spacingSystem?: string;
  animationStyle?: string;
  iconStyle?: string;
  shadowDepth?: string;
  borderStyle?: string;
}

export interface CustomTokens {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  errorColor?: string;
  warningColor?: string;
  successColor?: string;
  fontFamily?: string;
  headingFont?: string;
  baseFontSize?: string;
  baseSpacing?: string;
  borderRadius?: string;
  buttonHeight?: string;
  inputHeight?: string;
}

export interface DesignSystem {
  id: string;
  name: string;
  description: string | null;
  prompt: string;
  userId: string;
  colors: DesignSystemColors;
  typography: DesignSystemTypography;
  spacing: DesignSystemSpacing;
  borderRadius: DesignSystemBorderRadius;
  shadows: DesignSystemShadows;
  components: DesignSystemComponents;
  // Advanced Options
  designPreferences?: DesignPreferences;
  selectedComponents?: string[];
  customTokens?: CustomTokens;
  industry: string | null;
  category: string | null;
  version: number;
  isPublic: boolean;
  shareSlug: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string | null;
    email: string;
  };
}

export interface DesignSystemListItem {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  isPublic: boolean;
  shareSlug: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string | null;
    email: string;
  };
}

export interface FetchDesignSystemsResponse {
  success: boolean;
  designSystems: DesignSystemListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface GenerateDesignSystemRequest {
  prompt: string;
  industry?: string;
  designPreferences?: {
    colorScheme?: string;
    designStyle?: string;
    targetPlatform?: string;
    accessibility?: string;
    brandPersonality?: string;
    componentStyle?: string;
    layoutSystem?: string;
    typographyScale?: string;
    spacingSystem?: string;
    animationStyle?: string;
    iconStyle?: string;
    shadowDepth?: string;
    borderStyle?: string;
  };
  selectedComponents?: string[];
  customTokens?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    errorColor?: string;
    warningColor?: string;
    successColor?: string;
    fontFamily?: string;
    headingFont?: string;
    baseFontSize?: string;
    baseSpacing?: string;
    borderRadius?: string;
    buttonHeight?: string;
    inputHeight?: string;
  };
}

export interface GenerateDesignSystemResponse {
  success: boolean;
  id: string;
  shareSlug: string;
  name: string;
}

export interface DesignHistoryEntry {
  id: string;
  designSystemId: string;
  name: string;
  description: string | null;
  prompt: string;
  type: string;
  createdAt: string;
}

export interface FetchDesignHistoryResponse {
  success: boolean;
  history: DesignHistoryEntry[];
}

export interface ExportDesignSystemResponse {
  success: boolean;
  content: string;
  contentType: string;
  filename: string;
}

// ============================================
// State Types
// ============================================

export interface DesignSystemState {
  // Data
  currentDesignSystem: DesignSystem | null;
  designSystems: DesignSystemListItem[];
  totalCount: number;
  designHistory: DesignHistoryEntry[];
  
  // Loading States
  isLoading: boolean;
  isLoadingSingle: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isGenerating: boolean;
  isLoadingHistory: boolean;
  isExporting: boolean;
  
  // Error States
  error: string | null;
  singleError: string | null;
  historyError: string | null;
  
  // Pagination
  pagination: {
    limit: number;
    offset: number;
  };
  
  // UI State
  selectedIds: string[];
  isCreateModalOpen: boolean;
  isDeleteDialogOpen: boolean;
  isShareDialogOpen: boolean;
  previewDesignSystemId: string | null;
}

// ============================================
// Action Types
// ============================================

export interface DesignSystemActions {
  // Data Fetching
  fetchDesignSystems: (options?: { limit?: number; offset?: number }) => Promise<void>;
  fetchDesignSystemById: (id: string) => Promise<void>;
  
  // CRUD Operations
  createDesignSystem: (data: GenerateDesignSystemRequest) => Promise<GenerateDesignSystemResponse | null>;
  updateDesignSystem: (id: string, data: Partial<DesignSystem>) => Promise<DesignSystem | null>;
  deleteDesignSystem: (id: string) => Promise<boolean>;
  
  // History Operations
  fetchDesignHistory: (options?: { type?: string; limit?: number }) => Promise<void>;
  addToHistory: (entry: { designSystemId: string; name: string; description?: string; prompt: string; type?: string }) => Promise<boolean>;
  clearDesignHistory: () => Promise<boolean>;
  deleteHistoryItem: (id: string) => Promise<boolean>;
  renameHistoryItem: (id: string, name: string) => Promise<boolean>;
  
  // Export Operations
  exportDesignSystem: (id: string, format: 'json' | 'css' | 'tailwind' | 'scss' | 'figma' | 'figma-json' | 'tokens-studio') => Promise<string | null>;
  
  // UI State Management
  setSelectedIds: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  setCreateModalOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setShareDialogOpen: (open: boolean) => void;
  setPreviewDesignSystem: (id: string | null) => void;
  
  // Utility
  clearError: () => void;
  clearCurrentDesignSystem: () => void;
  reset: () => void;
}

// ============================================
// Combined Store Type
// ============================================

export type DesignSystemStore = DesignSystemState & DesignSystemActions;

// ============================================
// Initial State
// ============================================

const initialState: DesignSystemState = {
  currentDesignSystem: null,
  designSystems: [],
  totalCount: 0,
  designHistory: [],
  isLoading: false,
  isLoadingSingle: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isGenerating: false,
  isLoadingHistory: false,
  isExporting: false,
  error: null,
  singleError: null,
  historyError: null,
  pagination: {
    limit: 20,
    offset: 0,
  },
  selectedIds: [],
  isCreateModalOpen: false,
  isDeleteDialogOpen: false,
  isShareDialogOpen: false,
  previewDesignSystemId: null,
};

// ============================================
// API Helpers
// ============================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || error.details || 'An error occurred');
  }
  return response.json();
}

// ============================================
// Create Store
// ============================================

export const useDesignSystemStore = create<DesignSystemStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // Data Fetching Actions
      // ============================================

      fetchDesignSystems: async (options = {}) => {
        const { limit = 20, offset = 0 } = options;
        
        set({ isLoading: true, error: null });
        
        try {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`/api/design-systems?${params}`);
          const data: FetchDesignSystemsResponse = await handleResponse(response);
          
          set({
            designSystems: data.designSystems,
            totalCount: data.total,
            pagination: { limit: data.limit, offset: data.offset },
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch design systems';
          set({ error: message, isLoading: false });
        }
      },

      fetchDesignSystemById: async (id: string) => {
        set({ isLoadingSingle: true, singleError: null });
        
        try {
          const response = await fetch(`/api/design-systems/${id}`);
          const data: DesignSystem = await handleResponse(response);
          
          set({
            currentDesignSystem: data,
            isLoadingSingle: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch design system';
          set({ singleError: message, isLoadingSingle: false });
        }
      },

      // ============================================
      // CRUD Operations
      // ============================================

      createDesignSystem: async (data: GenerateDesignSystemRequest) => {
        set({ isCreating: true, error: null });
        
        try {
          const response = await fetch('/api/design-systems/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          
          const result: GenerateDesignSystemResponse = await handleResponse(response);
          
          // Refresh the list after creating
          await get().fetchDesignSystems();
          
          set({ isCreating: false });
          return result;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create design system';
          set({ error: message, isCreating: false });
          return null;
        }
      },

      updateDesignSystem: async (id: string, data: Partial<DesignSystem>) => {
        set({ isUpdating: true, error: null });
        
        try {
          const response = await fetch(`/api/design-systems/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          
          const updated: DesignSystem = await handleResponse(response);
          
          set((state) => ({
            currentDesignSystem: updated,
            designSystems: state.designSystems.map((ds) =>
              ds.id === id ? { ...ds, name: updated.name, description: updated.description } : ds
            ),
            isUpdating: false,
          }));
          
          return updated;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update design system';
          set({ error: message, isUpdating: false });
          return null;
        }
      },

      deleteDesignSystem: async (id: string) => {
        set({ isDeleting: true, error: null });
        
        try {
          const response = await fetch(`/api/design-systems/${id}`, {
            method: 'DELETE',
          });
          
          await handleResponse(response);
          
          set((state) => ({
            designSystems: state.designSystems.filter((ds) => ds.id !== id),
            totalCount: state.totalCount - 1,
            currentDesignSystem: state.currentDesignSystem?.id === id ? null : state.currentDesignSystem,
            isDeleting: false,
          }));
          
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete design system';
          set({ error: message, isDeleting: false });
          return false;
        }
      },

      // ============================================
      // History Operations
      // ============================================

      fetchDesignHistory: async (options = {}) => {
        const { type, limit = 20 } = options;
        
        set({ isLoadingHistory: true, historyError: null });
        
        try {
          const params = new URLSearchParams({
            limit: limit.toString(),
            ...(type && { type }),
          });
          
          const response = await fetch(`/api/design-systems/history?${params}`);
          const data: FetchDesignHistoryResponse = await handleResponse(response);
          
          set({
            designHistory: data.history,
            isLoadingHistory: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch design history';
          set({ historyError: message, isLoadingHistory: false });
        }
      },

      addToHistory: async (entry) => {
        try {
          const response = await fetch('/api/design-systems/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
          });
          
          await handleResponse(response);
          
          // Refresh history after adding
          await get().fetchDesignHistory();
          
          return true;
        } catch (error) {
          console.error('Failed to add to history:', error);
          return false;
        }
      },

      clearDesignHistory: async () => {
        try {
          const response = await fetch('/api/design-systems/history', {
            method: 'DELETE',
          });
          
          await handleResponse(response);
          
          set({ designHistory: [] });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to clear design history';
          set({ historyError: message });
          return false;
        }
      },

      deleteHistoryItem: async (id: string) => {
        try {
          const response = await fetch(`/api/design-systems/history/${id}`, {
            method: 'DELETE',
          });
          
          await handleResponse(response);
          
          set((state) => ({
            designHistory: state.designHistory.filter((item) => item.id !== id),
          }));
          
          toast.success('History item deleted');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete history item';
          set({ historyError: message });
          toast.error(message);
          return false;
        }
      },

      renameHistoryItem: async (id: string, name: string) => {
        try {
          const response = await fetch(`/api/design-systems/history/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          });
          
          await handleResponse(response);
          
          set((state) => ({
            designHistory: state.designHistory.map((item) =>
              item.id === id ? { ...item, name } : item
            ),
          }));
          
          toast.success('History item renamed');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to rename history item';
          set({ historyError: message });
          toast.error(message);
          return false;
        }
      },

      // ============================================
      // Export Operations
      // ============================================

      exportDesignSystem: async (id: string, format) => {
        set({ isExporting: true, error: null });
        
        try {
          const params = new URLSearchParams({ format });
          const response = await fetch(`/api/design-systems/${id}/export?${params}`);
          
          if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Export failed' }));
            throw new Error(error.error || 'Export failed');
          }
          
          const blob = await response.blob();
          const text = await blob.text();
          
          // Trigger download
          const contentDisposition = response.headers.get('Content-Disposition');
          const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || `${id}-export.${format}`;
          
          const downloadUrl = URL.createObjectURL(new Blob([text], { type: response.headers.get('Content-Type') || 'application/json' }));
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
          
          set({ isExporting: false });
          return text;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to export design system';
          set({ error: message, isExporting: false });
          return null;
        }
      },

      // ============================================
      // UI State Management
      // ============================================

      setSelectedIds: (ids: string[]) => {
        set({ selectedIds: ids });
      },

      toggleSelection: (id: string) => {
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((i) => i !== id)
            : [...state.selectedIds, id],
        }));
      },

      clearSelection: () => {
        set({ selectedIds: [] });
      },

      setCreateModalOpen: (open: boolean) => {
        set({ isCreateModalOpen: open });
      },

      setDeleteDialogOpen: (open: boolean) => {
        set({ isDeleteDialogOpen: open });
      },

      setShareDialogOpen: (open: boolean) => {
        set({ isShareDialogOpen: open });
      },

      setPreviewDesignSystem: (id: string | null) => {
        set({ previewDesignSystemId: id });
      },

      // ============================================
      // Utility Actions
      // ============================================

      clearError: () => {
        set({ error: null, singleError: null });
      },

      clearCurrentDesignSystem: () => {
        set({ currentDesignSystem: null, singleError: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'design-system-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist UI state, not data or loading states
        selectedIds: state.selectedIds,
        pagination: state.pagination,
        isCreateModalOpen: state.isCreateModalOpen,
      }),
    }
  )
);
