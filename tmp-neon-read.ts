/** Read-only inspection of the production Neon database. */
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  connectionTimeoutMillis: 30000,
});

const q = async (label: string, text: string) => {
  const { rows } = await pool.query(text);
  console.log(`\n== ${label} ==`);
  for (const r of rows) console.log(JSON.stringify(r));
};

await q(
  'sections (id, specialty_id)',
  `select id, specialty_id, sort_order from sections order by sort_order`,
);
await q(
  'ortho subsection -> question counts (top 8)',
  `select sub.id, sub.section_id,
          count(qs.id) filter (where qs.visible and not qs.flagged) as live
     from subsections sub
     left join questions qs on qs.subsection_id = sub.id
    where sub.id like 'ortho-%' or sub.section_id like 'ortho-%'
    group by sub.id, sub.section_id
    order by live desc
    limit 8`,
);
await q(
  'sample ortho question subsection_ids',
  `select subsection_id, count(*) as n from questions where id like 'ortho-%' group by subsection_id order by n desc limit 8`,
);
await q(
  'prs fingerprint (anatomy live count)',
  `select count(*) filter (where visible and not flagged) as anatomy_live
     from questions where subsection_id = 'anatomy'`,
);
await pool.end();
process.exit(0);
