

const createAgentValidationSchema = {
  body: {
    type: "object",
    required: [
      "first_name",
      "last_name",
      "email",
      "date_of_birth",
      "phone_number",
      "password"
    ],
    properties: {
      first_name: { type: "string", minLength: 1 },
      last_name: { type: "string", minLength: 1 },
      email: { type: "string", format: "email" },
      date_of_birth: { type: "string", format: "date-time" },
      phone_number: {
        type: "string",
        pattern: "^[+0-9]{7,15}$"
      },
      password: { type: "string", minLength: 6 }
    },
    errorMessage: {
      type: "The request body must be an object.",
      required: {
        first_name: "The 'first_name' field is required.",
        last_name: "The 'last_name' field is required.",
        email: "The 'email' field is required.",
        date_of_birth: "The 'date_of_birth' field is required.",
        phone_number: "The 'phone_number' field is required.",
        password: "The 'password' field is required."
      },
      properties: {
        first_name: "The 'first_name' field must be a string.",
        last_name: "The 'last_name' field must be a string.",
        email: "The 'email' field must be a string.",
        date_of_birth: "The 'date_of_birth' field must be a string.",
        phone_number: "The 'phone_number' field must be a string.",
        password: "The 'password' field must be a string."
      }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "string" },
        message: { type: "string" },
        error: { type: "boolean" },
        data: { type: "object" }
      }
    }
  }
}
 const updateAgentValidationSchema = {
  body: {
    type: "object",
    required: ["first_name", "last_name", "email", "phone_number", "password"],
    properties: {
      first_name: { type: "string", minLength: 1 },
      last_name: { type: "string", minLength: 1 },
      email: { type: "string", format: "email" },
      phone_number: {
        type: "string",
        pattern: "^[+0-9]{7,15}$"
      },
      password: { type: "string", minLength: 6 }
    },
    errorMessage: {
      type: "The request body must be an object.",
      required: {
        first_name: "The 'first_name' field is required.",
        last_name: "The 'last_name' field is required.",
        email: "The 'email' field is required.",
        phone_number: "The 'phone_number' field is required.",
        password: "The 'password' field is required."
      },
      properties: {
        first_name: "The 'first_name' field must be a string.",
        last_name: "The 'last_name' field must be a string.",
        email: "The 'email' field must be a valid email.",
        phone_number: "The 'phone_number' field must be a string.",
        password: "The 'password' field must be a string."
      }
    }
  }
}

export { createAgentValidationSchema, updateAgentValidationSchema };