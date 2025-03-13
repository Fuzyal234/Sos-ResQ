    const subscriptionCreateValidationSchema = {
        body: {
            type: 'object',
            required: ['name','members_count', 'includes_house', 'includes_car', 'price', 'description'],
            properties: {
                name: { type: 'string', minLength: 1 },
                members_count: { type: 'number', minimum: 1 },
                includes_house: { type: 'boolean' },
                includes_car: { type: 'boolean' },
                price: { type: 'number', minimum: 0 },
                description: { type: 'string', minLength: 1 },
            },
        },
    };

    export { subscriptionCreateValidationSchema };