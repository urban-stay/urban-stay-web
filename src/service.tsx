import axios from "axios";
import { BASE_URL } from '../config'
import type { RentRecord } from "./pages/RentPaymentPage";

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
            const { status, data, config } = error.response;

            console.error("Response Error:", {
                url: config?.url,
                status,
                data,
            });

            // ✅ Return only backend error message
            return Promise.reject(data?.error || "Something went wrong");
        }

        if (error.request) {
            return Promise.reject("No response from server");
        }

        return Promise.reject(error.message);
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

export async function updateStudentsAPI(id: any, reqData: any) {
    try {
        let endPoint = `students/${id}`;
        let response = await instance.put(endPoint, reqData);
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

export async function getUsersAPI() {
    try {
        let endPoint = `auth/list`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function updateUserByIdAPI(userId: number, reqData: any) {
    try {
        let endPoint = `auth/update/${userId}`;
        let response = await instance.put(endPoint, reqData);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function deleteUserByIdAPI(userId: number) {
    try {
        let endPoint = `auth/delete/${userId}`;
        let response = await instance.delete(endPoint);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function createUserAPI(reqData: any) {
    try {
        let endPoint = `auth/register`;
        let response = await instance.post(endPoint, reqData);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function fetchRentRecordsAPI(year: number, month: number) {
    try {
        let endPoint = `rent`;
        let response = await instance.get(endPoint, { params: { year, month } });
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function updateRentRecordAPI(record: RentRecord) {
    try {
        let endPoint = `rent`;
        let response = await instance.post(endPoint, record);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function createExpensesAPI(record: any, file?: File) {
    try {
        const formData = new FormData();

        formData.append("title", record.title);
        formData.append("amount", record.amount.toString());
        formData.append("expenseType", record.expenseType);
        formData.append("category", record.category);
        formData.append("date", record.date);
        formData.append("description", record.description);
        formData.append("paymentMethod", record.paymentMethod);
        formData.append("vendor", record.vendor);
        formData.append("status", record.status);

        if (file) {
            formData.append("billFile", file);
        }

        let endPoint = `expenses`;
        let response = await instance.post(endPoint, formData);
        return response;
    } catch (e) {
        console.log(e + " Occurred! Please Try again");
        throw e;
    }
}

export async function updateExpensesAPI(record: any, file?: File) {
    try {
        const formData = new FormData();

        formData.append("title", record.title);
        formData.append("amount", record.amount.toString());
        formData.append("expenseType", record.expenseType);
        formData.append("category", record.category);
        formData.append("date", record.date);
        formData.append("description", record.description || "");
        formData.append("paymentMethod", record.paymentMethod);
        formData.append("vendor", record.vendor || "");
        formData.append("status", record.status);

        if (file) {
            formData.append("billFile", file);
        }

        const endPoint = `expenses/${record.id}`;

        const response = await instance.put(endPoint, formData);

        return response;

    } catch (e) {
        console.log(e + " Occurred! Please Try again");
        throw e;
    }
}


export async function getExpensesAPI() {
    try {
        let endPoint = `expenses`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function getRoomsAPI() {
    try {
        let endPoint = `rooms`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}

export async function sendContactAPI(reqData: any) {
    try {
        let endPoint = `contact/send`;
        let response = await instance.post(endPoint, reqData);
        return response;
    } catch (e) {
        console.log(e + " Occured! Please Try again");
        throw e; // Throw the error instead of returning it
    }
}