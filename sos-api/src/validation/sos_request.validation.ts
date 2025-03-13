const sosRequestValidationSchema = {
    body: {
        type: 'object',
        required: ['latitude', 'longitude'],
        properties: {
            latitude: { type: 'number', minimum: -90 , maximum: 90, errorMessage: {
                type: 'The latitude must be a number.',
                minimum: 'The latitude must be between -90 and 90.',
                maximum: 'The latitude must be between -90 and 90.'
            } },
            longitude: { type: 'number', minimum: -180 , maximum: 180, errorMessage: {
                type: 'The longitude must be a number.',
                minimum: 'The longitude must be between -180 and 180.',
                maximum: 'The longitude must be between -180 and 180.'
            }},
        },
        errorMessage: {
            type: "The request body must be an object.",
            required: {
                latitude: "The 'latitude' field is required.",
                longitude: "The 'longitude' field is required."
            }
        },
    }
}

export { sosRequestValidationSchema };