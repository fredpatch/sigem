import AppErrorCode from "src/constants";
import { HttpStatusCode } from "src/constants/http-code";

export class AppError extends Error {
  constructor(
    public statusCode: HttpStatusCode,
    public message: string,
    public errorCode?: AppErrorCode
  ) {
    super(message);
    // Ensuring proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
