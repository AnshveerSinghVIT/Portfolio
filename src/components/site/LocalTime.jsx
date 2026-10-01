'use client';

import { useSyncExternalStore } from 'react';
import { profile } from '@/lib/data';

const fmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: profile.timezone,
});

const subscribe = (cb) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};
const getSnapshot = () => Math.floor(Date.now() / 1000);
const getServerSnapshot = () => null;

export default function LocalTime({ seconds = false }) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (now === null) return <span className="tabular">--:--</span>;
  const text = fmt.format(new Date(now * 1000));
  return <span className="tabular">{seconds ? text : text.slice(0, 5)} IST</span>;
}
