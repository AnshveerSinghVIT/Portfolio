import { SITE_URL } from '@/lib/site';

export default function sitemap() {
  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/flythrough`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ];
}
