"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productsApi,
  type Product,
  type ProductCategory,
  type ProductBrand,
  type ProductUnit,
  type GetProductsParams,
} from "@/lib/api/products";
import { queryKeys } from "../query-keys";
import type { LengthAwarePaginator } from "@/types";

/**
 * Hook to fetch paginated products
 */
export function useProductsQuery(params?: GetProductsParams, enabled = true) {
  return useQuery<LengthAwarePaginator<Product>>({
    queryKey: queryKeys.products.list(params as Record<string, unknown>),
    queryFn: () => productsApi.getProducts(params),
    enabled,
  });
}

/**
 * Hook to fetch single product by UUID or ID
 */
export function useProductQuery(uuidOrId?: string | number | null, businessId?: string | number, enabled = true) {
  return useQuery<Product>({
    queryKey: queryKeys.products.detail(String(uuidOrId ?? "")),
    queryFn: () => productsApi.getProduct(uuidOrId!, businessId),
    enabled: Boolean(uuidOrId && enabled),
  });
}

/**
 * Hook to fetch product categories
 */
export function useProductCategoriesQuery(businessId?: string | number, enabled = true) {
  return useQuery<ProductCategory[]>({
    queryKey: queryKeys.products.categories(businessId),
    queryFn: () => productsApi.getCategories(businessId),
    enabled,
  });
}

/**
 * Hook to fetch product brands
 */
export function useProductBrandsQuery(businessId?: string | number, enabled = true) {
  return useQuery<ProductBrand[]>({
    queryKey: queryKeys.products.brands(businessId),
    queryFn: () => productsApi.getBrands(businessId),
    enabled,
  });
}

/**
 * Hook to fetch product units
 */
export function useProductUnitsQuery(businessId?: string | number, enabled = true) {
  return useQuery<ProductUnit[]>({
    queryKey: queryKeys.products.units(businessId),
    queryFn: () => productsApi.getUnits(businessId),
    enabled,
  });
}

/**
 * Hook to create a new product
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; data: Product }, Error, { data: Partial<Product>; businessId?: string | number }>({
    mutationFn: ({ data, businessId }) => productsApi.createProduct(data, businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}

/**
 * Hook to update a product
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { uuidOrId: string | number; data: Partial<Product>; businessId?: string | number }>({
    mutationFn: ({ uuidOrId, data, businessId }) => productsApi.updateProduct(uuidOrId, data, businessId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(String(variables.uuidOrId)) });
    },
  });
}

/**
 * Hook to delete a product
 */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { uuidOrId: string | number; businessId?: string | number }>({
    mutationFn: ({ uuidOrId, businessId }) => productsApi.deleteProduct(uuidOrId, businessId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(String(variables.uuidOrId)) });
    },
  });
}
