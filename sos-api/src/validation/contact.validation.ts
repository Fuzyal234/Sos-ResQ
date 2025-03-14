const contactCreateValidationSchema = {
    body: {
        type: 'array',
        items: {
            type: 'object',
            required: ['name', 'relation', 'phone'],
            properties: {
                name: { type: 'string' },
                relation: { type: 'string' },
                phone: {
                    type: "string",
                    pattern: "^\\+?1?[-\\s.]?(\\([2-9][0-9]{2}\\)|[2-9][0-9]{2})[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4}$",
                    errorMessage: {
                        pattern: "The phone number must be a valid phone number."
                    }
                },
            },
            errorMessage: {
                required: {
                    name: "Name is required",
                    relation: "Relation is required",
                    phone: "Phone is required",
                },
                properties: {
                    name: "Name must be a string",
                    relation: "Relation must be a string",
                    phone: "Phone must be a string",
                },
            }
        }
    }
}

const contactUpdateValidationSchema = {
    body: {
        type: 'object',
        required: ['id','name', 'relation', 'phone'],
        properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            relation: { type: 'string' },
            phone: {
                type: "string",
                pattern: "^\\+?1?[-\\s.]?(\\([2-9][0-9]{2}\\)|[2-9][0-9]{2})[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4}$",
                errorMessage: {
                    pattern: "The 'phone' field must be a valid phone number."
                }
            }
        },
        errorMessage: {
            required: {
                id: "Id is required",
                name: "Name is required",
                relation: "Relation is required",
                phone: "Phone is required",
            },
            properties: {
                id: "Id must be a string",
                name: "Name must be a string",
                relation: "Relation must be a string",
                phone: "Phone must be a string",
            },
        }
    }
}

export { contactCreateValidationSchema, contactUpdateValidationSchema };