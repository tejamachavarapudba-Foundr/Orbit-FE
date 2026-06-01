import axios from "axios";

export type AppError = {
  message: string;
  statusCode?: number | undefined;
  code?: string | undefined;
};

export const toAppError = (error: unknown): AppError => {
  if (axios.isAxiosError(error)) {
    const message =
      typeof error.response?.data === "object" &&
      error.response.data !== null &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : error.message;

    return {
      message,
      statusCode: error.response?.status,
      code: error.code
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Something went wrong. Please try again." };
};
