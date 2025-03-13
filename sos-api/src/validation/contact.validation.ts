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
                    pattern: "^[+0-9]{7,15}$"
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
                pattern: "^[+0-9]{7,15}$"
            },
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