import '@fastify/oauth2';
import * as fastifyOauth2 from '@fastify/oauth2';

declare module 'fastify' {
    interface FastifyInstance {
        googleOAuth2: fastifyOauth2.OAuth2Namespace;
    }
}