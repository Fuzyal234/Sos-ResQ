const houseCreateValidationSchema = {
    body: {
        type: "object",
        required: ["address"],
        properties: {
            address: { type: "string" }
        },
    }
}

export { houseCreateValidationSchema };