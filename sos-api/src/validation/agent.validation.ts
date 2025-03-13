

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
    }
  }
}

export { createAgentValidationSchema, updateAgentValidationSchema };