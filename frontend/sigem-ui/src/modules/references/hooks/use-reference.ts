import { useQuery } from "@tanstack/react-query";
import { ReferenceKey, referenceSuggestionApi, ReferenceValueDTO } from "../api/reference-suggestion.api";


export function useReferences(params: {
    key: ReferenceKey,
    q: string
    limit?: number,
    dept?: string
    enabled?: boolean
}) {
    const { key, q, limit = 20, dept = "MG", enabled } = params

    const suggestions = useQuery<ReferenceValueDTO[]>({
        queryKey: ["references", dept, limit, q, key],
        enabled: enabled ?? (Boolean(key) && q.trim().length >= 1),
        queryFn: async () => referenceSuggestionApi.list({ key, q, limit, dept }),
        staleTime: 30_000,
    })

    return { suggestions }
}