const memberInviteValidationSchema = {
    body : {
        type : "object",
        required : ["email", "user_subscription_id"],
        properties : {
            email : { type : "string", format : "email" },
            user_subscription_id : { type : "string" }
        },
        errorMessage : {
            type : "The request body must be an object.",
            required : {
                email : "The 'email' field is required.",
                user_subscription_id : "The 'user_subscription_id' field is required."
            },
            properties : {
                email : "The 'email' field must be a string.",
                user_subscription_id : "The 'user_subscription_id' field must be a string."
            }
        }
    }
}

const confirmMemberInviteValidationSchema = {
    body : {
        type : "object",
        required: ["token"],
        properties : {
            token : { type : "string" }
        },
        errorMessage : {
            type : "The request body must be an object.",
            required : {
                token : "The 'token' field is required."
            },
            properties : {
                token : "The 'token' field must be a string."
            }
        }
    }
}

export { memberInviteValidationSchema, confirmMemberInviteValidationSchema };