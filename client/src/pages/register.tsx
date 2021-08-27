import { Box, Button } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/dist/client/router";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { RegisterInput, useRegisterMutation } from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";

const Register = () => {
  const router = useRouter();
  const initialValues: RegisterInput = {
    username: "",
    password: "",
    email: "",
  };

  const [registerUser, { data, error, loading: _registerLoading }] =
    useRegisterMutation();

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
    });

    if (response.data?.register.errors) {
      setErrors(mapFieldErrors(response.data.register.errors));
    } else if (response.data?.register.user) {
      router.push("/");
    }
  };

  return (
    <Wrapper>
      {error && <p>Fail to register</p>}
      {data && data.register.success && <p>Register successfully</p>}
      <Formik initialValues={initialValues} onSubmit={onRegisterSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="Username"
              label="Username"
              type="text"
            />

            <Box mt={4}>
              <InputField
                name="password"
                placeholder="Password"
                label="Password"
                type="password"
              />
            </Box>

            <Box mt={4}>
              <InputField
                name="email"
                placeholder="Email"
                label="Email"
                type="text"
              />
            </Box>

            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
