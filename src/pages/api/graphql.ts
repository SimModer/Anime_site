// src/pages/api/graphql.ts
// GraphQL endpoint at /api/graphql
// Supports GET (playground) and POST (queries)

import { createYoga } from 'graphql-yoga';
import { schema } from '../../lib/schema';
import type { APIRoute } from 'astro';

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  // Enables the visual playground at /api/graphql in browser
  graphiql: true,
  landingPage: false,
});

export const GET: APIRoute = async ({ request }) => {
  return yoga.handleRequest(request, {});
};

export const POST: APIRoute = async ({ request }) => {
  return yoga.handleRequest(request, {});
};
