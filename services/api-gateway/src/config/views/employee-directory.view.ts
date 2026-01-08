import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({ name: "employee_directory" })
export class EmployeeDirectory {
  @ViewColumn()
  matricule!: string;

  @ViewColumn()
  firstName!: string;

  @ViewColumn()
  lastName!: string;

  @ViewColumn()
  direction!: string;

  @ViewColumn()
  fonction!: string;
}
