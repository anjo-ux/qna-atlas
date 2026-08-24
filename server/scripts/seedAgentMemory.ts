import { seedAgentMemoryFromHistory } from "../jobs/feedbackLearningJob";

seedAgentMemoryFromHistory()
  .then((r) => {
    console.log("Seeded agent memory:", r);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
