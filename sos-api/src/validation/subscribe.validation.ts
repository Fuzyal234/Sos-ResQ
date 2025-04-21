const subscriptionCreateValidationSchema = {
  body: {
    type: 'object',
    required: [
      'name',
      'members_count',
      'includes_house',
      'includes_car',
      'monthly_price',
      'yearly_price',
      'description',
    ],
    properties: {
      name: { type: 'string', minLength: 1 },
      members_count: { type: 'number', minimum: 1 },
      includes_house: { type: 'boolean' },
      includes_car: { type: 'boolean' },
      monthly_price: { type: 'number', minimum: 0 },
      yearly_price: { type: 'number', minimum: 0 },
      description: { type: 'string', minLength: 1 },
    },
    errorMessage: {
      type: 'The request body must be an object.',
      required: {
        name: "The 'name' field is required.",
        members_count: "The 'members_count' field is required.",
        includes_house: "The 'includes_house' field is required.",
        includes_car: "The 'includes_car' field is required.",
        monthly_price: "The 'monthly_price' field is required.",
        yearly_price: "The 'yearly_price' field is required.",
        description: "The 'description' field is required.",
      },
      properties: {
        name: "The 'name' field must be a string.",
        members_count: "The 'members_count' field must be a number.",
        includes_house: "The 'includes_house' field must be a boolean.",
        includes_car: "The 'includes_car' field must be a boolean.",
        monthly_price: "The 'monthly_price' field must be a number.",
        yearly_price: "The 'yearly_price' field must be a number.",
        description: "The 'description' field must be a string.",
      },
    },
  },
};

const subscriptionUpdateValidationSchema = {
  body: {
    type: 'object',
    required: [
      'name',
      'members_count',
      'includes_house',
      'includes_car',
      'monthly_price',
      'yearly_price',
      'description',
    ],
    properties: {
      name: { type: 'string', minLength: 1 },
      members_count: { type: 'number', minimum: 1 },
      includes_house: { type: 'boolean' },
      includes_car: { type: 'boolean' },
      monthly_price: { type: 'number', minimum: 0 },
      yearly_price: { type: 'number', minimum: 0 },
      description: { type: 'string', minLength: 1 },
    },
    errorMessage: {
      type: 'The request body must be an object.',
      required: {
        name: "The 'name' field is required.",
        members_count: "The 'members_count' field is required.",
        includes_house: "The 'includes_house' field is required.",
        includes_car: "The 'includes_car' field is required.",
        monthly_price: "The 'monthly_price' field is required.",
        yearly_price: "The 'yearly_price' field is required.",
        description: "The 'description' field is required.",
      },
      properties: {
        name: "The 'name' field must be a string.",
        members_count: "The 'members_count' field must be a number.",
        includes_house: "The 'includes_house' field must be a boolean.",
        includes_car: "The 'includes_car' field must be a boolean.",
        monthly_price: "The 'monthly_price' field must be a number.",
        yearly_price: "The 'yearly_price' field must be a number.",
        description: "The 'description' field must be a string.",
      },
    },
  },
};

const subscribeValidationSchema = {
  body: {
    type: 'object',
    required: ['subscription_id', 'auto_renewal'],
    properties: {
      user_subscription_id: { type: 'string' },
      auto_renewal: { type: 'boolean' },
    },
    errorMessage: {
      type: 'The request body must be an object.',
      required: {
        subscription_id: "The 'subscription_id' field is required.",
        auto_renewal: "The 'auto_renewal' field is required.",
      },
      properties: {
        subscription_id: "The 'subscription_id' field must be a string.",
        auto_renewal: "The 'auto_renewal' field must be a boolean.",
      },
    },
  },
};
export { subscriptionCreateValidationSchema, subscriptionUpdateValidationSchema, subscribeValidationSchema };
