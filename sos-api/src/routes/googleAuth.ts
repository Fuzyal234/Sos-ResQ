// import fastifyCookie from '@fastify/cookie';
// import fastifySession from '@fastify/session';
// import fastifyOauth2 from '@fastify/oauth2';
// import { FastifyInstance } from 'fastify';
// import GmailUser from '../models/GmailUser';
// import crypto from 'crypto';

// const generateState = () => crypto.randomBytes(16).toString('hex');

// export default async function googleAuthRoute(fastify: FastifyInstance) {
//     if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
//         throw new Error('Missing Google OAuth credentials. Please check your environment variables.');
//     } 

//     await fastify.register(fastifyCookie);
//     await fastify.register(fastifySession, {
//         secret: process.env.SESSION_SECRET || 'P1SoRckr0rZlBRn8N4mSzlTXK2PISwPg',
//         cookie: { 
//             secure: process.env.NODE_ENV === 'production',
//             httpOnly: true,
//             sameSite: 'lax'
//         },
//     });

//     await fastify.register(fastifyOauth2, {
//         name: 'googleOAuth2',
//         scope: ['profile', 'email'],
//         credentials: {
//             client: {
//                 id: process.env.GOOGLE_CLIENT_ID,
//                 secret: process.env.GOOGLE_CLIENT_SECRET,
//             },
//             auth: fastifyOauth2.GOOGLE_CONFIGURATION,
//         },
//         startRedirectPath: '/auth/google',
//         callbackUri: `${process.env.BASE_URL}/auth/google/callback`,
//     });

//     // Remove the manual declaration of '/auth/google' route

//     fastify.get('/auth/google/callback', async (request, reply) => {
//         try {
//             const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
            
//             const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
//                 headers: { Authorization: `Bearer ${token.access_token}` },
//             });
//             const userInfo = await userInfoResponse.json();

//             let user = await GmailUser.findOne({ where: { email: userInfo.email } });
//             if (!user) {
//                 user = await GmailUser.create({
//                     email: userInfo.email,
//                     name: userInfo.name,
//                     googleId: userInfo.id,
//                     profilePicture: userInfo.picture,
//                 });
//                 fastify.log.info(`New user signed up: ${user.email}`);
//             } else {
//                 fastify.log.info(`Existing user logged in: ${user.email}`);
//             }

//             request.session.set('userId', user.id);

//             reply.redirect('/dashboard');
//         } catch (error) {
//             fastify.log.error(error);
//             reply.code(500).send({ error: 'Authentication failed' });
//         }
//     });

//     fastify.get('/auth/debug', async (request, reply) => {
//         reply.send({
//             baseUrl: process.env.BASE_URL,
//             hasClientId: !!process.env.GOOGLE_CLIENT_ID,
//             hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
//             callbackUrl: `${process.env.BASE_URL}/auth/google/callback`
//         });
//     });

//     fastify.get('/logout', (request, reply) => {
//         request.session.destroy((err) => {
//             if (err) {
//                 reply.status(500).send('Could not log out, please try again');
//             } else {
//                 reply.redirect('/');
//             }
//         });
//     });
// }
