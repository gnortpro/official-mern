import { Box, Button, Flex, Spinner, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { MeDocument, MeQuery, RegisterInput, useRegisterMutation } from '../generated/graphql';
import { mapFieldErrors } from '../helpers/mapFieldErrors';
import { useCheckAuth } from '../utils/checkAuth';

const Register = () => {
    const router = useRouter();
    const toast = useToast();

    const initialValues: RegisterInput = {
        username: '',
        password: '',
        email: '',
    };

    const { data: authData, loading: authLoading } = useCheckAuth();

    const [registerUser, { loading: _registerLoading }] = useRegisterMutation();

    const onRegisterSubmit = async (values: RegisterInput, { setErrors }: FormikHelpers<RegisterInput>) => {
        const response = await registerUser({
            variables: {
                registerInput: values,
            },
            update(cache, { data }) {
                if (data?.register.success) {
                    cache.writeQuery<MeQuery>({ query: MeDocument, data: { me: data.register.user } });
                }
            },
        });

        if (response.data?.register.errors) {
            setErrors(mapFieldErrors(response.data.register.errors));
        } else if (response.data?.register.user) {
            toast({
                title: 'Welcome',
                description: response?.data.register.user.username,
                status: 'success',
                duration: 5000,
                position: 'top-right',
                isClosable: true,
            });
            router.push('/');
        }
    };

    const backToHome = () => router.push('/');

    return (
        <>
            {!authLoading && authData?.me ? (
                <Flex justifyContent="center" alignItems="center" minH="100vh">
                    <Spinner />
                </Flex>
            ) : (
                <Wrapper>
                    <Formik initialValues={initialValues} onSubmit={onRegisterSubmit}>
                        {({ isSubmitting }) => (
                            <Form>
                                <InputField name="username" placeholder="Username" label="Username" type="text" />

                                <Box mt={4}>
                                    <InputField
                                        name="password"
                                        placeholder="Password"
                                        label="Password"
                                        type="password"
                                    />
                                </Box>

                                <Box mt={4}>
                                    <InputField name="email" placeholder="Email" label="Email" type="text" />
                                </Box>

                                <Button type="submit" colorScheme="teal" mt={4} isLoading={isSubmitting}>
                                    Register
                                </Button>

                                <Button type="button" colorScheme="gray" mt={4} ml={4} onClick={backToHome}>
                                    Back to Home
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Wrapper>
            )}
        </>
    );
};

export default Register;
