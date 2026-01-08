// import assert from "node:assert";
import { HttpStatusCode } from "src/constants/http-code";
import AppErrorCode from "src/constants";
import { AppError } from "./app-error";

type AppAssert = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  appErrorCode?: AppErrorCode
) => asserts condition;

/**
 * Asserts a condition and throws an AppError if the condition is falsy.
 */
const appAssert: AppAssert = (
  condition,
  httpStatusCode,
  message,
  appErrorCode
) => {
  if (!condition) {
    throw new AppError(httpStatusCode, message, appErrorCode);
  }
};

export default appAssert;
