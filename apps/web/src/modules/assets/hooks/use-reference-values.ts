import { useQuery } from "@tanstack/react-query"
import { ReferenceAPI } from "../api/reference.api"

type RefItem = { items: { value: string, usageCount?: number } }

export function useReferenceValues(params: { key: string, q: string }) {
    const { key, q } = params

    const list = useQuery<RefItem[]>({
        queryKey: ["reference-values", key, q],
        enabled: Boolean(key) && q.length >= 1,
        queryFn: () => ReferenceAPI.list({ key, q, limit: 20 }),
        staleTime: 30_000
    })

    return { list }
}