// Server-only: every caller is a server component or metadata route, so this
// never needs to reach the browser bundle.
export const SITE_URL = (process.env.SITE_URL || 'https://anshveersingh.vercel.app').replace(/\/$/, '');
