"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type Brand,
  type GetBrandsParams,
  type CreateBrandInput,
  type UpdateBrandInput,
  type BrandDeleteResponse,
  brandsApi,
} from "@/lib/api/brands";
import {
  fetchBrandsWithIndexedDbCache,
  saveBrandsToIndexedDb,
  removeBrandFromIndexedDb,
  clearBrandsIndexedDbCache,
  type CachedBrandsResult,
} from "@/lib/storage/brand-cache";
import { useBrandStore } from "@/stores/useBrandStore";
import { queryKeys } from "../query-keys";

/**
 * Hook to fetch paginated brands with offline-first IndexedDB cache
 */
export function useBrandsQuery(params?: GetBrandsParams, enabled = true) {
  return useQuery<CachedBrandsResult>({
    queryKey: queryKeys.brands.list(params as Record<string, unknown>),
    queryFn: async () => {
      const result = await fetchBrandsWithIndexedDbCache(params);
      if (result?.data) {
        useBrandStore.getState().setBrands(result.data);
      }
      return result;
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch single brand detail
 */
export function useBrandQuery(uuid?: string, enabled = true) {
  return useQuery<Brand>({
    queryKey: queryKeys.brands.detail(uuid || ""),
    queryFn: () => brandsApi.getBrand(uuid!),
    enabled: Boolean(uuid && enabled),
  });
}

/**
 * Hook to create a brand
 */
export function useCreateBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation<Brand, Error, CreateBrandInput | FormData>({
    mutationFn: async (data) => {
      const res = await brandsApi.createBrand(data);
      return res.data;
    },
    onSuccess: (newBrand) => {
      // 1. Invalidate queries & cache in IndexedDB
      saveBrandsToIndexedDb([newBrand]).catch(() => {});

      // 2. Synchronize Zustand store
      const current = useBrandStore.getState().brands;
      useBrandStore.getState().setBrands([newBrand, ...current.filter((b) => b.uuid !== newBrand.uuid)]);

      // 3. TanStack Query cache invalidation
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
    },
  });
}

/**
 * Hook to update a brand
 */
export function useUpdateBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Brand,
    Error,
    { idOrUuid: string | number; data: UpdateBrandInput | Partial<Brand> | FormData }
  >({
    mutationFn: async ({ idOrUuid, data }) => {
      const res = await brandsApi.updateBrand(idOrUuid, data);
      return res.data;
    },
    onSuccess: (updatedBrand) => {
      saveBrandsToIndexedDb([updatedBrand]).catch(() => {});
      const current = useBrandStore.getState().brands;
      useBrandStore.getState().setBrands(current.map((b) => (b.uuid === updatedBrand.uuid ? updatedBrand : b)));
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.detail(updatedBrand.uuid) });
    },
  });
}

/**
 * Hook to delete a brand from storage with IndexedDB cleanup
 */
export function useDeleteBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    BrandDeleteResponse,
    Error,
    { idOrUuid: string | number; business_uuid?: string } | string | number
  >({
    mutationFn: async (args) => {
      const idOrUuid = typeof args === "object" ? args.idOrUuid : args;
      const business_uuid = typeof args === "object" ? args.business_uuid : undefined;
      return brandsApi.deleteBrand(idOrUuid, business_uuid);
    },
    onSuccess: (_, args) => {
      const idOrUuid = typeof args === "object" ? args.idOrUuid : args;
      removeBrandFromIndexedDb(idOrUuid).catch(() => {});
      const current = useBrandStore.getState().brands;
      useBrandStore.getState().setBrands(
        current.filter((b) => b.uuid !== String(idOrUuid) && b.id !== idOrUuid)
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
    },
  });
}

/**
 * Hook to quick toggle brand active status (on / off)
 */
export function useToggleBrandStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Brand,
    Error,
    { brand: Brand }
  >({
    mutationFn: async ({ brand }) => {
      const targetId = brand.id || brand.uuid;
      const res = await brandsApi.toggleBrandStatus(
        targetId,
        brand.is_active,
        brand.business_uuid
      );
      return res.data;
    },
    onMutate: async ({ brand }) => {
      // Optimistic update in Zustand store immediately for zero lag
      const current = useBrandStore.getState().brands;
      const optimisticBrand = { ...brand, is_active: !brand.is_active };
      useBrandStore.getState().setBrands(
        current.map((b) => (b.uuid === brand.uuid || b.id === brand.id ? optimisticBrand : b))
      );
      return { previousBrands: current };
    },
    onSuccess: (updatedBrand) => {
      saveBrandsToIndexedDb([updatedBrand]).catch(() => {});
      const current = useBrandStore.getState().brands;
      useBrandStore.getState().setBrands(
        current.map((b) => (b.uuid === updatedBrand.uuid || b.id === updatedBrand.id ? updatedBrand : b))
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousBrands) {
        useBrandStore.getState().setBrands(context.previousBrands);
      }
    },
  });
}

/**
 * Hook to force synchronize / re-cache brands into IndexedDB
 */
export function useSyncBrandsMutation() {
  const queryClient = useQueryClient();

  return useMutation<CachedBrandsResult, Error, GetBrandsParams | undefined>({
    mutationFn: async (params) => {
      const res = await brandsApi.getBrands(params);
      if (res.data && res.data.length > 0) {
        await saveBrandsToIndexedDb(res.data);
      }
      return {
        data: res.data,
        meta: res.meta,
        isOffline: false,
        totalCached: res.data.length,
        lastCachedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
    },
  });
}

/**
 * Hook to clear the IndexedDB brand cache
 */
export function useClearBrandCacheMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => clearBrandsIndexedDbCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
    },
  });
}
