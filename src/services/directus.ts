import { authentication, createDirectus, graphql, rest } from '@directus/sdk';

const directusClient = createDirectus(import.meta.env.VITE_API_URL as string).with(graphql());
const directusClientWithRest = createDirectus(import.meta.env.VITE_API_URL as string).with(rest()).with(authentication('json'));

export { directusClient, directusClientWithRest };