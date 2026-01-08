import { MariaDataSource } from "src/config/maria.datasource";
import { EmployeeDirectory } from "src/config/views/employee-directory.view";

type ListParams = {
  q?: string;
  limit: number;
  page: number;
  direction?: string;
  fonction?: string;
};

export type EmployeeDirectoryItem = {
  matricule: string; // "0098"
  firstName: string;
  lastName: string;
  direction: string | null;
  fonction: string | null;
};

export class EmployeeDirectoryService {
  private repo = MariaDataSource.getRepository(EmployeeDirectory);

  async findByMatricule(matricule: string) {
    return this.repo.findOne({
      where: { matricule },
    });
  }

  async search(query: string, limit = 10) {
    const q = query.trim();

    return this.repo
      .createQueryBuilder("e")
      .where(
        `
      CAST(e.matricule AS CHAR) LIKE :q
      OR LPAD(e.matricule, 4, '0') LIKE :q
      OR e.firstName LIKE :q
      OR e.lastName LIKE :q
      `,
        { q: `%${q}%` }
      )
      .limit(limit)
      .getMany();
  }

  async list(params: ListParams) {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 50);
    const page = Math.max(params.page ?? 1, 1);
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder("e");

    // q search (matricule / firstName / lastName)
    if (params.q?.trim()) {
      const q = `%${params.q.trim()}%`;
      qb.andWhere(
        `(e.matricule LIKE :q OR e.firstName LIKE :q OR e.lastName LIKE :q)`,
        { q }
      );
    }

    if (params.direction) {
      qb.andWhere(`e.direction = :direction`, { direction: params.direction });
    }

    if (params.fonction) {
      qb.andWhere(`e.fonction = :fonction`, { fonction: params.fonction });
    }

    qb.orderBy("e.matricule", "ASC").skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit };
  }
}

export const employeeDirectoryService = new EmployeeDirectoryService();
