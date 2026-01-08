import { api } from "@/lib/axios";


export class ReferenceAPI {
    static async list(params: { key: string, q: string, limit: number }) {
        const response = await api.get<any>("/reference-values", { params });
        return response.data;
    }

    static async create(key: string, value: string) {
        const response = await api.post<any>("/reference-values", { key, value });

        // console.log(response);
        return response.data;
    }


}
