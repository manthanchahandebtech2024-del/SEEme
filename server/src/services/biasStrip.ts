import { BiasFlag } from "../utils/types";

const NAME_PATTERNS = /^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/gm;
const EMAIL_PATTERN = /[\w.-]+@[\w.-]+\.\w+/g;
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const ADDRESS_PATTERN = /\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)[\s,]*[\w\s]*\d{5}/gi;
const LINKEDIN_PATTERN = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/gi;
const GITHUB_PATTERN = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/gi;
const AGE_PATTERN = /\b(?:age|born|dob|date of birth)[\s:]*\d+/gi;
const GENDER_WORDS = /\b(he|she|him|her|his|hers|mr\.|mrs\.|ms\.|sir|madam)\b/gi;
const PHOTO_PATTERN = /\b(?:photo|headshot|picture|portrait)\b/gi;

const PRESTIGE_UNIVERSITIES = [
  "harvard", "yale", "princeton", "stanford", "mit", "columbia",
  "caltech", "oxford", "cambridge", "upenn", "dartmouth", "brown",
  "cornell", "duke", "northwestern", "uchicago", "berkeley",
  "johns hopkins", "carnegie mellon", "georgetown", "nyu", "ucla",
  "iit", "iim", "bits pilani"
];

export function stripBias(text: string): { anonymized: string; flags: BiasFlag[] } {
  const flags: BiasFlag[] = [];
  let anonymized = text;

  const nameMatches = text.match(NAME_PATTERNS);
  if (nameMatches && nameMatches.length > 0) {
    anonymized = anonymized.replace(NAME_PATTERNS, "[CANDIDATE]");
    flags.push({
      type: "name_removed",
      description: "Candidate name(s) stripped to prevent name-origin bias",
      severity: "info",
    });
  }

  if (EMAIL_PATTERN.test(text)) {
    anonymized = anonymized.replace(EMAIL_PATTERN, "[EMAIL]");
    flags.push({
      type: "email_removed",
      description: "Email address removed",
      severity: "info",
    });
  }

  if (PHONE_PATTERN.test(text)) {
    anonymized = anonymized.replace(PHONE_PATTERN, "[PHONE]");
  }

  if (ADDRESS_PATTERN.test(text)) {
    anonymized = anonymized.replace(ADDRESS_PATTERN, "[ADDRESS]");
    flags.push({
      type: "address_removed",
      description: "Physical address stripped to prevent location bias",
      severity: "info",
    });
  }

  if (LINKEDIN_PATTERN.test(text)) {
    anonymized = anonymized.replace(LINKEDIN_PATTERN, "[LINKEDIN]");
  }

  if (GITHUB_PATTERN.test(text)) {
    anonymized = anonymized.replace(GITHUB_PATTERN, "[GITHUB]");
  }

  if (AGE_PATTERN.test(text)) {
    anonymized = anonymized.replace(AGE_PATTERN, "[AGE_REDACTED]");
    flags.push({
      type: "age_indicator",
      description: "Age-related information detected and removed",
      severity: "warning",
    });
  }

  const genderMatches = text.match(GENDER_WORDS);
  if (genderMatches && genderMatches.length > 0) {
    anonymized = anonymized.replace(GENDER_WORDS, "[PRONOUN]");
    flags.push({
      type: "gender_indicator",
      description: `${genderMatches.length} gendered term(s) neutralized`,
      severity: "warning",
    });
  }

  const lowerText = text.toLowerCase();
  const foundPrestige = PRESTIGE_UNIVERSITIES.filter((u) => lowerText.includes(u));
  if (foundPrestige.length > 0) {
    flags.push({
      type: "prestige_bias_risk",
      description: `Prestige institution detected (${foundPrestige.join(", ")}). Score based on skills, not brand.`,
      severity: "warning",
    });
  }

  return { anonymized, flags };
}
