import { GraphQLClient } from 'graphql-request';
import { getSession } from 'next-auth/react';

const getGqlEndpoint = () => {
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/graphql`;
    }
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5050';
    return `${backendUrl.replace(/\/$/, '')}/graphql`;
};

const GQL_ENDPOINT = getGqlEndpoint();

export const gqlClient = new GraphQLClient(GQL_ENDPOINT, {
    requestMiddleware: async (request) => {
        let token = null;
        if (typeof window !== 'undefined') {
            const session = await getSession();
            token = (session as any)?.accessToken;
        } else {
            try {
                const { auth } = await import('@/auth');
                const session = await auth();
                token = (session as any)?.accessToken;
            } catch (err) {
                console.error('[GraphQL Client] Error fetching session token on server:', err);
            }
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(request.headers as Record<string, string>),
            'apollo-require-preflight': 'true',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return {
            ...request,
            headers,
        };
    },
});
