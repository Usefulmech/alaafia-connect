import { Client, Account, Databases, ID } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a22b03c00282c2004f0';

const client = new Client();

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export { ID };
export default client;
