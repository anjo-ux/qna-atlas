/** Allowed values for `users.training_level` (signup only; internal use). */
export const TRAINING_LEVEL_OPTIONS = [
  "Medical Student",
  "Sub-Intern",
  "Prelim Resident",
  "Integrated Resident (PGY1)",
  "Integrated Resident (PGY2)",
  "Integrated Resident (PGY3)",
  "Integrated Resident (PGY4)",
  "Integrated Resident (PGY5)",
  "Integrated Resident (PGY6)",
  "Independent Resident (IND1)",
  "Independent Resident (IND2)",
  "Independent Resident (IND3)",
  "Fellow",
  "Practicing (Board Collection)",
  "Other",
] as const;

export type TrainingLevelOption = (typeof TRAINING_LEVEL_OPTIONS)[number];

const OPTION_SET = new Set<string>(TRAINING_LEVEL_OPTIONS);

export function isAllowedTrainingLevel(value: string): value is TrainingLevelOption {
  return OPTION_SET.has(value);
}
