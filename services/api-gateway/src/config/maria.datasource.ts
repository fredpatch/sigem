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
