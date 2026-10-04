// Region names are matched to k-means clusters by anchor membership, so they survive re-runs.
export const REGION_NAMES = [
  { name: 'The Web Coast', anchors: ['realpro', 'nextjs', 'react'] },
  { name: 'Cloud Reaches', anchors: ['self-healing', 'aws', 'gcp'] },
  { name: 'Systems Ridge', anchors: ['ghidra', 'os', 'compilers'] },
  { name: 'Language Highlands', anchors: ['llms', 'rag', 'examguide'] },
  { name: 'Foundation Plains', anchors: ['vit', 'dsa', 'toc'] },
  { name: 'Model Basin', anchors: ['vertex', 'sklearn', 'mental-health'] },
];
