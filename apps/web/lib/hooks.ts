/**
 * TanStack Query hooks for COSMOS API
 *
 * Wraps the API client functions with React Query for caching,
 * automatic refetching, and optimistic updates.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  Profile,
  ChartCalculation,
  Synthesis,
  CreateProfileRequest,
  UpdateProfileRequest,
  CalculateChartRequest,
  GenerateSynthesisRequest,
  LoginRequest,
  RegisterRequest,
} from '@cosmos/types';
import {
  login as apiLogin,
  register as apiRegister,
  getProfiles,
  getProfile,
  createProfile as apiCreateProfile,
  updateProfile as apiUpdateProfile,
  deleteProfile as apiDeleteProfile,
  calculateChart as apiCalculateChart,
  getChart,
  listCharts,
  generateSynthesis as apiGenerateSynthesis,
  getSynthesis,
  listSynthesesForChart,
} from '@/lib/api';
import { useCosmosStore } from '@/lib/store';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const queryKeys = {
  profiles: ['profiles'] as const,
  profile: (id: string) => ['profiles', id] as const,
  charts: ['charts'] as const,
  chart: (id: string) => ['charts', id] as const,
  synthesis: (id: string) => ['synthesis', id] as const,
  synthesesForChart: (chartId: string) => ['syntheses', chartId] as const,
};

// ---------------------------------------------------------------------------
// Auth hooks
// ---------------------------------------------------------------------------

export function useLogin() {
  const setAuth = useCosmosStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const res = await apiLogin(payload);
      return res;
    },
    onSuccess: (res) => {
      // API returns { accessToken, refreshToken, user } at top level
      const data = res as unknown as {
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; createdAt: string };
      };
      setAuth({
        user: {
          id: data.user.id,
          email: data.user.email,
          createdAt: data.user.createdAt,
          updatedAt: data.user.createdAt,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}

export function useRegister() {
  const setAuth = useCosmosStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const res = await apiRegister(payload);
      return res;
    },
    onSuccess: (res) => {
      const data = res as unknown as {
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; createdAt: string };
      };
      setAuth({
        user: {
          id: data.user.id,
          email: data.user.email,
          createdAt: data.user.createdAt,
          updatedAt: data.user.createdAt,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Profile hooks
// ---------------------------------------------------------------------------

export function useProfiles() {
  const token = useCosmosStore((s) => s.accessToken);

  return useQuery({
    queryKey: queryKeys.profiles,
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const res = await getProfiles(token);
      // API returns { profiles: [...], total: N } at top level
      const data = res as unknown as { profiles: Profile[]; total: number };
      return data.profiles;
    },
    enabled: !!token,
  });
}

export function useProfile(id: string) {
  const token = useCosmosStore((s) => s.accessToken);

  return useQuery({
    queryKey: queryKeys.profile(id),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const res = await getProfile(id, token);
      const data = res as unknown as { profile: Profile };
      return data.profile;
    },
    enabled: !!token && !!id,
  });
}

export function useCreateProfile() {
  const token = useCosmosStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProfileRequest) => {
      if (!token) throw new Error('Not authenticated');
      const res = await apiCreateProfile(payload, token);
      const data = res as unknown as { profile: Profile };
      return data.profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles });
    },
  });
}

export function useUpdateProfile() {
  const token = useCosmosStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProfileRequest;
    }) => {
      if (!token) throw new Error('Not authenticated');
      const res = await apiUpdateProfile(id, payload, token);
      const data = res as unknown as { profile: Profile };
      return data.profile;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles });
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(variables.id),
      });
    },
  });
}

export function useDeleteProfile() {
  const token = useCosmosStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('Not authenticated');
      await apiDeleteProfile(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles });
    },
  });
}

// ---------------------------------------------------------------------------
// Chart hooks
// ---------------------------------------------------------------------------

export function useCalculateChart() {
  const token = useCosmosStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CalculateChartRequest) => {
      const res = await apiCalculateChart(payload, token);
      const data = res as unknown as {
        chart: ChartCalculation & { id: string };
        cached: boolean;
      };
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.charts });
    },
  });
}

export function useChart(id: string) {
  const token = useCosmosStore((s) => s.accessToken);

  return useQuery({
    queryKey: queryKeys.chart(id),
    queryFn: async () => {
      const res = await getChart(id, token);
      const data = res as unknown as { chart: ChartCalculation & { id: string } };
      return data.chart;
    },
    enabled: !!id,
  });
}

export function useCharts() {
  const token = useCosmosStore((s) => s.accessToken);

  return useQuery({
    queryKey: queryKeys.charts,
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const res = await listCharts(token);
      const data = res as unknown as { charts: Array<ChartCalculation & { id: string }> };
      return data.charts ?? [];
    },
    enabled: !!token,
  });
}

// ---------------------------------------------------------------------------
// Synthesis hooks
// ---------------------------------------------------------------------------

interface SynthesisApiResponse {
  synthesis: Synthesis;
  message?: string;
  cached?: boolean;
}

interface SynthesesListResponse {
  syntheses: Synthesis[];
  total: number;
}

export function useGenerateSynthesis() {
  const token = useCosmosStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: GenerateSynthesisRequest) => {
      if (!token) throw new Error('Not authenticated');
      const res = await apiGenerateSynthesis(payload, token);
      const data = res as unknown as SynthesisApiResponse;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.synthesesForChart(data.synthesis.chartId),
      });
    },
  });
}

export function useSynthesis(id: string, polling = false) {
  const token = useCosmosStore((s) => s.accessToken);

  return useQuery({
    queryKey: queryKeys.synthesis(id),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const res = await getSynthesis(id, token);
      const data = res as unknown as SynthesisApiResponse;
      return data.synthesis;
    },
    enabled: !!token && !!id,
    refetchInterval: polling ? 3000 : false,
  });
}

export function useSynthesesForChart(chartId: string) {
  const token = useCosmosStore((s) => s.accessToken);

  return useQuery({
    queryKey: queryKeys.synthesesForChart(chartId),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const res = await listSynthesesForChart(chartId, token);
      const data = res as unknown as SynthesesListResponse;
      return data.syntheses ?? [];
    },
    enabled: !!token && !!chartId,
  });
}
