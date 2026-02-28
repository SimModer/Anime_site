// src/lib/schema.ts
// GraphQL schema — types and resolvers for the anime API

import { createSchema } from 'graphql-yoga';
import {
  getOngoingAnimes,
  getAllOngoingAnimes,
  getItemById,
  searchMedia,
} from './db';

export const schema = createSchema({
  typeDefs: `
    type Anime {
      id: Int
      name: String
      english_name: String
      japanese_name: String
      other_name: String
      type: String
      status: String
      studios: String
      poster_url: String
      genres: String
      premiered: String
      episodes: Int
    }

    type Query {
      """Get ongoing anime for the home page (default: 8)"""
      ongoingAnimes(limit: Int): [Anime]

      """Get all ongoing anime for the ongoing page"""
      allOngoingAnimes: [Anime]

      """Get a single anime by ID"""
      anime(id: Int!): Anime

      """Search anime by name or english name"""
      searchAnime(term: String!, limit: Int): [Anime]
    }
  `,
  resolvers: {
    Query: {
      ongoingAnimes: async (_, { limit = 8 }) => getOngoingAnimes(limit),
      allOngoingAnimes: async () => getAllOngoingAnimes(),
      anime: async (_, { id }) => getItemById(id),
      searchAnime: async (_, { term, limit = 30 }) => searchMedia(term, limit),
    },
  },
});
