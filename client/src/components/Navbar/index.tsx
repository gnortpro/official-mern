import React from 'react';
import NextLink from 'next/link';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';

import { MeDocument, MeQuery, useLogoutMutation, useMeQuery } from '../../generated/graphql';

const Navbar = () => {
    const { data, loading: useMeLoading } = useMeQuery({
        variables: {},
    });

    const [useLogOut, { data: _logoutData, loading: logoutLoading }] = useLogoutMutation({
        variables: {},
    });

    const handleLogOut = async () =>
        await useLogOut({
            update(cache, { data }) {
                if (data?.logout) {
                    cache.writeQuery<MeQuery>({ query: MeDocument, data: { me: null } });
                }
            },
        });

    return (
        <div>
            <Box bg="tan" p={4}>
                <Flex maxW="800" justifyContent="space-between" m="auto" align="center">
                    <NextLink href="/">
                        <Heading>My site</Heading>
                    </NextLink>
                    <Box>
                        {!useMeLoading && !data?.me && (
                            <>
                                <NextLink href="/register">
                                    <Button mr={4}>Register</Button>
                                </NextLink>
                                <NextLink href="/login">
                                    <Button>Login</Button>
                                </NextLink>
                            </>
                        )}
                        {!useMeLoading && data?.me && (
                            <Button onClick={handleLogOut} isLoading={logoutLoading}>
                                Logout
                            </Button>
                        )}
                    </Box>
                </Flex>
            </Box>
        </div>
    );
};

export default Navbar;
