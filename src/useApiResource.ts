import {useCallback, useMemo, useState} from "react";
import type {AxiosInstance} from "axios";
import {
    createApiResourceClient,
    type ApiResourceClient,
    type FieldErrors,
    type PerRequestOptions,
    type RouteFn,
    ValidationError,
} from "@salvobee/laravel-api-client";

export interface UseApiResourceArgs {
    resourceKey: string;
    resourceRouteParam: string;
    additionalRouteParams?: Record<string, unknown> | null;
    client: AxiosInstance;
    routeFn?: RouteFn;
    requestConfig?: PerRequestOptions;
    /** Clear errors before every call (default: true) */
    clearErrorsOnCall?: boolean;
}

export interface UseApiResourceReturn<
    TResource,
    TListResponse,
    TCreatePayload,
    TUpdatePayload
> extends ApiResourceClient<TResource, TListResponse, TCreatePayload, TUpdatePayload> {
    /** Last validation errors from backend, or null */
    errors: FieldErrors | null;
    /** Manually reset the validation errors */
    resetErrors: () => void;
}

export function useApiResource<
    TResource = unknown,
    TListResponse = unknown,
    TCreatePayload = Partial<TResource>,
    TUpdatePayload = Partial<TResource>
>({
      resourceKey,
      resourceRouteParam,
      additionalRouteParams = null,
      client,
      routeFn,
      requestConfig,
      clearErrorsOnCall = true,
  }: UseApiResourceArgs): UseApiResourceReturn<TResource, TListResponse, TCreatePayload, TUpdatePayload> {
    const [errors, setErrors] = useState<FieldErrors | null>(null);

    const base = useMemo(
        () =>
            createApiResourceClient<
                TResource,
                TListResponse,
                TCreatePayload,
                TUpdatePayload
            >({
                resourceKey,
                resourceRouteParam,
                additionalRouteParams,
                client,
                routeFn,
                requestConfig,
            }),
        [
            resourceKey,
            resourceRouteParam,
            JSON.stringify(additionalRouteParams ?? {}),
            client,
            routeFn,
            JSON.stringify(requestConfig ?? {}),
        ]
    );

    const resetErrors = useCallback(() => setErrors(null), []);

    // Small wrapper to trap ValidationError and set state
    const trap = useCallback(
        async <R>(call: () => Promise<R>): Promise<R> => {
            if (clearErrorsOnCall) setErrors(null);
            try {
                return await call();
            } catch (e) {
                if (e instanceof ValidationError) {
                    setErrors(e.errors);
                }
                throw e;
            }
        },
        [clearErrorsOnCall]
    );

    return {
        errors,
        resetErrors,
        get: (id, cfg) => trap(() => base.get(id, cfg)),
        list: (params, cfg) => trap(() => base.list(params, cfg)),
        update: (id, data, cfg) => trap(() => base.update(id, data, cfg)),
        store: (data, cfg) => trap(() => base.store(data, cfg)),
        destroy: (id, cfg) => trap(() => base.destroy(id, cfg)),
    };
}

export default useApiResource;