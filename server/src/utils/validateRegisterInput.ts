import { RegisterInput } from "../types/RegisterInput";

export const validateRegisterInput = (registerInput: RegisterInput) => {
  if (!registerInput.email.includes("@"))
    return {
      message: "Invalid email address",
      errors: [
        {
          field: "email",
          message: "Email must include @ symbol",
        },
      ],
    };

  if (registerInput.username.length <= 2)
    return {
      message: "Invalid username",
      errors: [
        {
          field: "username",
          message: "Username must be at least 2 characters",
        },
      ],
    };

  if (registerInput.username.includes("@"))
    return {
      message: "Invalid username address",
      errors: [
        {
          field: "username",
          message: "Username can not include @ symbol",
        },
      ],
    };

  if (registerInput.password.length <= 2)
    return {
      message: "Invalid password",
      errors: [
        {
          field: "password",
          message: "Password must be at least 2 characters",
        },
      ],
    };

  return null;
};
