import { useCallback } from 'react';

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export const useGraphQL = () => {
  const query = useCallback(async <T = unknown>(
    queryString: string,
    variables?: Record<string, unknown>
  ): Promise<GraphQLResponse<T>> => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryString,
          variables,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('GraphQL query error:', error);
      return { errors: [{ message: 'Network error' }] };
    }
  }, []);

  return { query };
}; 