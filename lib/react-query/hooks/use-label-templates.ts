"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type LabelTemplate,
  type GetLabelTemplatesParams,
  type CreateLabelTemplateInput,
  type UpdateLabelTemplateInput,
  type LabelTemplateListResponse,
  type LabelTemplateResponse,
  type LabelTemplateDeleteResponse,
  labelTemplatesApi,
} from "@/lib/api/label-templates";
import { queryKeys } from "../query-keys";

/**
 * Hook to fetch paginated or filtered label templates
 */
export function useLabelTemplatesQuery(params?: GetLabelTemplatesParams, enabled = true) {
  return useQuery<LabelTemplateListResponse>({
    queryKey: queryKeys.labelTemplates.list(params as Record<string, unknown>),
    queryFn: () => labelTemplatesApi.getTemplates(params),
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch a single label template by ID or UUID
 */
export function useLabelTemplateQuery(
  id?: string | number,
  businessUuid?: string,
  enabled = true
) {
  return useQuery<LabelTemplateResponse>({
    queryKey: queryKeys.labelTemplates.detail(id ?? ""),
    queryFn: () => labelTemplatesApi.getTemplate(id!, businessUuid),
    enabled: Boolean(id && enabled),
  });
}

/**
 * Hook to create a label template with automatic cache invalidation
 */
export function useCreateLabelTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    LabelTemplateResponse,
    Error,
    { input: CreateLabelTemplateInput; businessUuid?: string }
  >({
    mutationFn: async ({ input, businessUuid }) => {
      return labelTemplatesApi.createTemplate(input, businessUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labelTemplates.lists() });
    },
  });
}

/**
 * Hook to update a label template with automatic cache invalidation
 */
export function useUpdateLabelTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    LabelTemplateResponse,
    Error,
    { id: string | number; input: UpdateLabelTemplateInput; businessUuid?: string }
  >({
    mutationFn: async ({ id, input, businessUuid }) => {
      return labelTemplatesApi.updateTemplate(id, input, businessUuid);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labelTemplates.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.labelTemplates.detail(variables.id),
      });
    },
  });
}

/**
 * Hook to delete a label template with automatic cache invalidation
 */
export function useDeleteLabelTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    LabelTemplateDeleteResponse,
    Error,
    { id: string | number; businessUuid?: string }
  >({
    mutationFn: async ({ id, businessUuid }) => {
      return labelTemplatesApi.deleteTemplate(id, businessUuid);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labelTemplates.lists() });
      queryClient.removeQueries({
        queryKey: queryKeys.labelTemplates.detail(variables.id),
      });
    },
  });
}
