import { useEffect } from 'react';
import { useRouter } from 'next/dist/client/router';

import { useMeQuery } from '../generated/graphql';

export const useCheckAuth = () => {
    const router = useRouter();

    const { data, loading } = useMeQuery();

    console.log('datadatadata', data);
    console.log('loadingloadingloading', loading);
    

    useEffect(() => {
        if (!loading && data?.me && (router.route === '/login' || router.route === '/register')) {
            router.replace('/');
        }
    }, [loading, data, router]);

    return { data, loading };
};
