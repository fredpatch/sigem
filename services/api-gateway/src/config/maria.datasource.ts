import "reflect-metadata";
import { DataSource } from "typeorm";
import { EmployeeDirectory } from "./views/employee-directory.view";

function hasMariaConfig() {
  return Boolean(
    process.env.MARIADB_HOST &&
      process.env.MARIADB_USER &&
      process.env.MARIADB_DATABASE,
  );
}

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
  if (!hasMariaConfig()) {
    console.warn(
      "[mariadb] Skipping view provisioning because MariaDB is not configured",
    );
    return;
  }

  await MariaDataSource.query(employeeDirectoryViewSql);
}

export async function initializeMariaIfConfigured() {
  if (!hasMariaConfig()) {
    console.warn("[mariadb] MariaDB is not configured, skipping initialization");
    return false;
  }

  if (!MariaDataSource.isInitialized) {
    await MariaDataSource.initialize();
  }

  await ensureMariaViews();
  console.log("MariaDB connected");
  return true;
}
