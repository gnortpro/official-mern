import { FieldError } from "../generated/graphql";

export const mapFieldErrors = (errors: FieldError[]) => {
  return errors.reduce((accumulator, error) => {
    return {
      ...accumulator,
      [error.field]: error.message,
    };
  }, {});
};
