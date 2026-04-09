import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "employee_directory",
  expression: `
    SELECT
      LPAD(CAST(p.numat AS CHAR), 4, '0') AS matricule,
      p.prenag AS firstName,
      p.nomag AS lastName,
      d.libdirec AS direction,
      f.libfct AS fonction
    FROM personnel_anac p
    LEFT JOIN service_anac s
      ON s.codeserv = p.codeserv
    LEFT JOIN direction_anac d
      ON d.codedirec = s.codedirec
    LEFT JOIN fonction_anac f
      ON f.codefct = p.codefct
  `,
})
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
