const subscriptionCreateValidationSchema = {
    body: {
        type: 'object',
        required: ['name', 'members_count', 'includes_house', 'includes_car', 'price', 'description'],
        properties: {
            name: { type: 'string', minLength: 1 },
            members_count: { type: 'number', minimum: 1 },
            includes_house: { type: 'boolean' },
            includes_car: { type: 'boolean' },
            price: { type: 'number', minimum: 0 },
            description: { type: 'string', minLength: 1 },
        },
        errorMessage: {
            type: 'The request body must be an object.',
            required: {
                name: 'The \'name\' field is required.',
                members_count: 'The \'members_count\' field is required.',
                includes_house: 'The \'includes_house\' field is required.',
                includes_car: 'The \'includes_car\' field is required.',
                price: 'The \'price\' field is required.',
                description: 'The \'description\' field is required.',
            },
            properties: {
                name: 'The \'name\' field must be a string.',
                members_count: 'The \'members_count\' field must be a number.',
                includes_house: 'The \'includes_house\' field must be a boolean.',
                includes_car: 'The \'includes_car\' field must be a boolean.',
                price: 'The \'price\' field must be a number.',
                description: 'The \'description\' field must be a string.',
            },
        },
    },
};

const subscriptionUpdateValidationSchema = {
    body: {
        type: 'object',
        required: ['name', 'members_count', 'includes_house', 'includes_car', 'price', 'description'],
        properties: {
            name: { type: 'string', minLength: 1 },
            members_count: { type: 'number', minimum: 1 },
            includes_house: { type: 'boolean' },
            includes_car: { type: 'boolean' },
            price: { type: 'number', minimum: 0 },
            description: { type: 'string', minLength: 1 },
        },
        errorMessage: {
            type: 'The request body must be an object.',
            required: {
                name: 'The \'name\' field is required.',
                members_count: 'The \'members_count\' field is required.',
                includes_house: 'The \'includes_house\' field is required.',
                includes_car: 'The \'includes_car\' field is required.',
                price: 'The \'price\' field is required.',
                description: 'The \'description\' field is required.',
            },
            properties: {
                name: 'The \'name\' field must be a string.',
                members_count: 'The \'members_count\' field must be a number.',
                includes_house: 'The \'includes_house\' field must be a boolean.',
                includes_car: 'The \'includes_car\' field must be a boolean.',
                price: 'The \'price\' field must be a number.',
                description: 'The \'description\' field must be a string.',
            },
        },
    }
}

const subscribeValidationSchema = {
    body: {
        type: 'object',
        required: ['user_subscription_id', 'auto_renewal'],
        properties: {
            user_subscription_id: { type: 'string' },
            auto_renewal: { type: 'boolean' },
        },
        errorMessage: {
            type: 'The request body must be an object.',
            required: {
                user_subscription_id: 'The \'user_subscription_id\' field is required.',
                auto_renewal: 'The \'auto_renewal\' field is required.',
            },
            properties: {
                user_subscription_id: 'The \'user_subscription_id\' field must be a string.',
                auto_renewal: 'The \'auto_renewal\' field must be a boolean.',
            },
        },
    }
}
export { subscriptionCreateValidationSchema, subscriptionUpdateValidationSchema, subscribeValidationSchema };