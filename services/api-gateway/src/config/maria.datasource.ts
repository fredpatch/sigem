import "reflect-metadata";
import { DataSource } from "typeorm";
import { EmployeeDirectory } from "./views/employee-directory.view";

export const MariaDataSource = new DataSource({
  type: "mariadb",
  host: process.env.MARIADB_HOST,
  port: Number(process.env.MARIADB_PORT || 3307),
  username: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,

  // Important
  synchronize: false, // DB legacy
  logging: false,

  entities: [EmployeeDirectory],
});

const employeeDirectoryViewSql = `
  CREATE OR REPLACE VIEW employee_directory AS
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
`;

export async function ensureMariaViews() {
  await MariaDataSource.query(employeeDirectoryViewSql);
}
