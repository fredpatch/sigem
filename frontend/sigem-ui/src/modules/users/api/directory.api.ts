import { api } from "@/lib/axios";

export type DirectoryEmployee = {
  matricule: string;
  firstName: string;
  lastName: string;
  direction: string;
  fonction: string;
};

export async function getEmployeeByMatricule(matricule: string) {
  const res = await api.get<DirectoryEmployee>(
    `/directory/${encodeURIComponent(matricule)}`
  );
  return res.data;
}
