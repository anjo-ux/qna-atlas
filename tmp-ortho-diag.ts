/**
 * Reproduces what the affected account receives on the ortho host.
 * Prints only counts / status codes — no personal data.
 */
import http from 'http';
import { sql } from 'drizzle-orm';
import { db } from './server/db';
import { storage } from './server/storage';

const ORTHO = 'ortho-atlas.com';
const PRS = 'prs-atlas.com';
const sids: string[] = [];

function request(method: string, path: string, host: string, cookie?: string) {
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }>(
    (resolve, reject) => {
      const req = http.request(
        {
          host: '127.0.0.1',
          port: 5000,
          method,
          path,
          headers: {
            Host: host,
            'X-Forwarded-Host': PRS,
            'X-Forwarded-Proto': 'https',
            ...(cookie ? { Cookie: cookie } : {}),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }));
        },
      );
      req.on('error', reject);
      req.end();
    },
  );
}

const lookup: any = await db.execute(
  sql`select id, first_name from users where lower(first_name) = 'orr' order by created_at asc limit 1`,
);
const row = (Array.isArray(lookup) ? lookup : lookup.rows)?.[0] as
  | { id: string; first_name: string }
  | undefined;
if (!row) {
  console.log('no matching account found');
  process.exit(1);
}
console.log(`account: first_name=${row.first_name} (id hidden)`);

for (const host of [ORTHO, PRS]) {
  const { plainToken } = await storage.createAuthHandoffToken({
    userId: row.id,
    targetSpecialtyId: host === ORTHO ? 'ortho' : 'prs',
    nextPath: '/',
  });
  const consume = await request(
    'GET',
    `/api/auth/handoff/consume?token=${encodeURIComponent(plainToken)}`,
    host,
  );
  let jar = '';
  for (const line of consume.headers['set-cookie'] ?? []) {
    const [pair] = line.split(';');
    const [name, value] = pair.split('=');
    if (name === 'atlas.sid') sids.push(decodeURIComponent(value).replace(/^s:/, '').split('.')[0]);
    jar += (jar ? '; ' : '') + pair;
  }

  console.log(`\n=== ${host} ===`);
  const spec = await request('GET', '/api/specialty', host, jar);
  console.log(`/api/specialty ${spec.status}: ${spec.body.slice(0, 400)}`);

  const sub = await request('GET', '/api/subscription', host, jar);
  console.log(`/api/subscription ${sub.status}: ${sub.body.slice(0, 300)}`);

  const sections = await request('GET', '/api/sections', host, jar);
  if (sections.status === 200) {
    const arr = JSON.parse(sections.body);
    const questions = arr.reduce(
      (n: number, s: any) =>
        n + (s.subsections ?? []).reduce((m: number, x: any) => m + (x.questions?.length ?? 0), 0),
      0,
    );
    console.log(`/api/sections 200: ${arr.length} sections, ${questions} questions, first=${arr[0]?.id}`);
  } else {
    console.log(`/api/sections ${sections.status}: ${sections.body.slice(0, 200)}`);
  }
}

for (const sid of sids) {
  await db.execute(sql`delete from sessions where sid = ${sid}`);
}
await db.execute(
  sql`delete from auth_handoff_tokens where user_id = ${row.id} and created_at > now() - interval '10 minutes'`,
);
console.log(`\ncleanup: sessions=${sids.length}`);
process.exit(0);
