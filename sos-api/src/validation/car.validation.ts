
const carCreateValidationSchema = {
    body: {
        type: "object",
        required: ["make", "model", "year", "color", "license_plate"],
        properties: {
            make: { type: "string" },
            model: { type: "string" },
            year: { type: "integer" },
            color: { type: "string" },
            license_plate: { type: "string" },
        },
        errorMessage: {
            required: {
                make: "Make is required",
                model: "Model is required",
                year: "Year is required",
                color: "Color is required",
                license_plate: "License plate is required",
            },
            properties: {
                make: "Make must be a string",
                model: "Model must be a string",
                year: "Year must be a number",
                color: "Color must be a string",
                license_plate: "License plate must be a string",
            },
        },
    },
};

export { carCreateValidationSchema };