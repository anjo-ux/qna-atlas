/**
 * Runs the current getSections() code against the production Neon database.
 * Read-only apart from the idempotent schema guards storage already performs.
 */
process.env.DATABASE_URL = process.env.NEON_DATABASE_URL;

const { storage } = await import('./server/storage');

for (const specialty of ['ortho', 'prs'] as const) {
  const sections = await storage.getSections(specialty);
  const questions = sections.reduce(
    (n, s) => n + s.subsections.reduce((m, x) => m + x.questions.length, 0),
    0,
  );
  console.log(`${specialty}: ${sections.length} sections, ${questions} questions`);
  for (const sec of sections.slice(0, 3)) {
    const perSub = sec.subsections.map((s) => `${s.id}:${s.questions.length}`).join(' ');
    console.log(`   ${sec.id} -> ${perSub || '(no subsections)'}`);
  }
}

const meta = await storage.getSectionsMeta('ortho');
console.log(`ortho meta sections: ${meta.length}`);
process.exit(0);
