import router from "@/router";
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_GATEWAY_URL!,
  withCredentials: true,
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let userMessage = "An Error occurred";

    // console.log("🚀 ~ error AXIOS:", error);
    // Axios can't reach server (e.g., ECONNREFUSED, timeout, DNS Fail)
    if (!error.response) {
      if (error.code === "ERR_NETWORK") {
        userMessage = "[auth-service] Connection Timed Out (slow response!)";
      } else {
        userMessage = "auth-service is temporarily unavailable";
      }
    } else {
      const status = error.response.status;
      const message = error.response?.data.message;

      // console.log(message);

      // Custom mapping based on backend response
      // 🔥 Redirect when token expired or missing
      if (
        // status === 401 ||
        message === "Missing accessToken" ||
        message === "Token expired" ||
        message === "Invalid token"
      ) {
        userMessage = message;
        router.navigate("/login");
      }
      if (status === 403) userMessage = "Forbidden";
      if (status === 404) userMessage = "Not Found";
      if (status === 500) userMessage = "Internal Server";
    }

    // Propagate the error to the caller
    return Promise.reject({ ...error, message: userMessage });
  }
);
