import { Box, Button, Flex, Spinner, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { LoginInput, MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import { mapFieldErrors } from '../helpers/mapFieldErrors';
import { useCheckAuth } from '../utils/checkAuth';

const Login = () => {
    const router = useRouter();
    const toast = useToast();

    const { data: authData, loading: authLoading } = useCheckAuth();

    const initialValues: LoginInput = {
        usernameOrEmail: '',
        password: '',
    };

    const [userLogin, { loading: _registerLoading }] = useLoginMutation();

    const onLoginSubmit = async (values: LoginInput, { setErrors }: FormikHelpers<LoginInput>) => {
        const response = await userLogin({
            variables: {
                loginInput: values,
            },
            update(cache, { data }) {
                // const meData = cache.readQuery({ query: MeDocument });
                if (data?.login.success) {
                    cache.writeQuery<MeQuery>({ query: MeDocument, data: { me: data.login.user } });
                }
            },
        });

        if (response.data?.login.errors) {
            setErrors(mapFieldErrors(response.data.login.errors));
        } else if (response.data?.login.user) {
            toast({
                title: 'Welcome back',
                description: response?.data.login.user.username,
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
                    <Formik initialValues={initialValues} onSubmit={onLoginSubmit}>
                        {({ isSubmitting }) => (
                            <Form>
                                <InputField
                                    name="usernameOrEmail"
                                    placeholder="Username or Email"
                                    label="Username or Email"
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

                                <Button type="submit" colorScheme="teal" mt={4} isLoading={isSubmitting}>
                                    Login
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

export default Login;
