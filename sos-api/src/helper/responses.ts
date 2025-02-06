
export const successResponse = (message: string, results: any, statusCode: number) => {
    return {
        status: "success",
        message,
        error: false,
        code: statusCode,
        results,
    };
};


export const errorResponse = (message: string, statusCode: number) => {
    const codes = [200, 201, 400, 401, 404, 403, 422, 500];
    const findCode = codes.find((code) => code == statusCode);

    return {
        status: "error",
        message,
        code: findCode || 500,
        error: true,
    };
};

export const validationResponse = (errors: any) => {
    return {
        message: 'Validation errors',
        error: true,
        code: 422,
        errors,
    };
};
