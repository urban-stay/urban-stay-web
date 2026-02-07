import axios from "axios";
import { BASE_URL } from '../config'

const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
    },
});

instance.interceptors.request.use(
    async (config) => {
        const isAuthEndpoint =
            config.url?.includes("auth/login") ||
            config.url?.includes("auth/register");

        if (config != null && !isAuthEndpoint) {
            if (config.data && !(config.data instanceof FormData)) {
                config.headers["Content-Type"] = "application/json";
            }

            const token = sessionStorage.getItem("authToken");
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;

            // Handle session expiration
            if (status === 403 && window.location.pathname !== "/login") {
                alert("Your session has expired. Please log out and log in again!");
                // Optionally redirect to login or trigger logout
                // window.location.href = '/login';
            }

            console.error("Response Error:", {
                url: error.config?.url,
                status,
                data,
            });
            return Promise.reject(error);
        }

        if (error.request) {
            console.error("No Response Received:", {
                url: error.config?.url,
                request: error.request,
            });
        } else {
            console.error("Request Setup Error:", error.message);
        }

        return Promise.reject(error);
    }
);

//login
export async function loginAPI(reqData: any) {
    try {
        let endPoint = `auth/login`;
        let response = await instance.post(endPoint, reqData);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function createStudentsAPI(reqData: any) {
    try {
        let endPoint = `students`;
        let response = await instance.post(endPoint, reqData);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function getStudentsAPI() {
    try {
        let endPoint = `students`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function createEmployeesAPI(reqData: any) {
    try {
        let endPoint = `employees`;
        let response = await instance.post(endPoint, reqData);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function getEmployeesAPI() {
    try {
        let endPoint = `employees`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function updateEmployeeByIdAPI(employeeId: number, reqData: any) {
    try {
        let endPoint = `employees/${employeeId}`;
        let response = await instance.put(endPoint, reqData);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function deleteEmployeeByIdAPI(employeeId: number) {
    try {
        let endPoint = `employees/${employeeId}/permanent`;
        let response = await instance.delete(endPoint);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}