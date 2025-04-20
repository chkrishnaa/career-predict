import type {
  ResumeSectionToLines,
  TextItem,
  FeatureSet,
} from "lib/parse-resume-from-pdf/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import {
  isBold,
  hasNumber,
  hasComma,
  hasLetter,
  hasLetterAndIsAllUpperCase,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import { getTextWithHighestFeatureScore } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system";

// Name
export const matchOnlyLetterSpaceOrPeriod = (item: TextItem) =>
  item.text.match(/^[a-zA-Z\s\.]+$/);

// Email
// Simple email regex: xxx@xxx.xxx (xxx = anything not space)
export const matchEmail = (item: TextItem) => {
  const match = item.text.match(/\S*@\S+\.\S+/);
  if (!match) return null;
  
  // Clean up the email by removing any invalid prefix characters
  const email = match[0].replace(/^[^a-zA-Z0-9]+/, '');
  return [email] as RegExpMatchArray;
};
const hasAt = (item: TextItem) => item.text.includes("@");

// Phone
// Update regex to handle various phone formats including country codes
export const matchPhone = (item: TextItem) => {
  // More comprehensive regex to capture different phone formats:
  // - International format with + (e.g., +1 123-456-7890)
  // - International format without + (e.g., 00 123-456-7890)
  // - Various separators (spaces, dots, dashes)
  // - Parentheses for area codes
  // - Different digit groupings
  const phoneRegex = 
    /(?:(?:\+|00)?\d{1,3}[-.\s]?)?(?:\(?\d{1,4}\)?[-.\s]?)?(?:\d{1,4}[-.\s]?){1,3}\d{1,4}/;
  
  const match = item.text.match(phoneRegex);
  if (!match) return null;
  
  // Clean up the phone number - keep only digits, plus, parens, and hyphens
  const phone = match[0].replace(/[^\d\+\(\)\-\s]/g, '');
  return [phone] as RegExpMatchArray;
};
const hasParenthesis = (item: TextItem) => item.text.includes("(");

// Location
// Simple location regex that matches "<City>, <ST>"
export const matchCityAndState = (item: TextItem) =>
  item.text.match(/[A-Z][a-zA-Z\s]+, [A-Z]{2}/);

// Url
// Simple url regex that matches "xxx.xxx/xxx" (xxx = anything not space)
export const matchUrl = (item: TextItem) => {
  const match = item.text.match(/\S+\.[a-z]+\/\S+/);
  if (!match) return null;
  
  // Clean up the URL by removing any invalid prefix characters
  const url = match[0].replace(/^[^a-zA-Z0-9]+/, '');
  return [url] as RegExpMatchArray;
};

// Match http(s)://xxx.xxx
const matchUrlHttpFallback = (item: TextItem) => {
  const match = item.text.match(/https?:\/\/\S+/);
  if (!match) return null;
  
  // Clean up the URL by removing any invalid prefix characters
  const url = match[0].replace(/^[^h]+/, '');
  return [url] as RegExpMatchArray;
};

// Match www.xxx.xxx
const matchUrlWwwFallback = (item: TextItem) => {
  const match = item.text.match(/www\.\S+\.\S+/);
  if (!match) return null;
  
  // Clean up the URL by removing any invalid prefix characters
  const url = match[0].replace(/^[^w]+/, '');
  return [url] as RegExpMatchArray;
};
const hasSlash = (item: TextItem) => item.text.includes("/");

// Summary
const has4OrMoreWords = (item: TextItem) => item.text.split(" ").length >= 4;

/**
 *              Unique Attribute
 * Name         Bold or Has all uppercase letter
 * Email        Has @
 * Phone        Has ()
 * Location     Has ,    (overlap with summary)
 * Url          Has slash
 * Summary      Has 4 or more words
 */

/**
 * Name -> contains only letters/space/period, e.g. Leonardo W. DiCaprio
 *         (it isn't common to include middle initial in resume)
 *      -> is bolded or has all letters as uppercase
 */
const NAME_FEATURE_SETS: FeatureSet[] = [
  [matchOnlyLetterSpaceOrPeriod, 3, true],
  [isBold, 2],
  [hasLetterAndIsAllUpperCase, 2],
  // Match against other unique attributes
  [hasAt, -4], // Email
  [hasNumber, -4], // Phone
  [hasParenthesis, -4], // Phone
  [hasComma, -4], // Location
  [hasSlash, -4], // Url
  [has4OrMoreWords, -2], // Summary
];

// Email -> match email regex xxx@xxx.xxx
const EMAIL_FEATURE_SETS: FeatureSet[] = [
  [matchEmail, 4, true],
  [isBold, -1], // Name
  [hasLetterAndIsAllUpperCase, -1], // Name
  [hasParenthesis, -4], // Phone
  [hasComma, -4], // Location
  [hasSlash, -4], // Url
  [has4OrMoreWords, -4], // Summary
];

// Phone -> match phone regex (xxx)-xxx-xxxx
const PHONE_FEATURE_SETS: FeatureSet[] = [
  [matchPhone, 4, true],
  [hasLetter, -4], // Name, Email, Location, Url, Summary
];

// Location -> match location regex <City>, <ST>
const LOCATION_FEATURE_SETS: FeatureSet[] = [
  [matchCityAndState, 4, true],
  [isBold, -1], // Name
  [hasAt, -4], // Email
  [hasParenthesis, -3], // Phone
  [hasSlash, -4], // Url
];

// URL -> match url regex xxx.xxx/xxx
const URL_FEATURE_SETS: FeatureSet[] = [
  [matchUrl, 4, true],
  [matchUrlHttpFallback, 3, true],
  [matchUrlWwwFallback, 3, true],
  [isBold, -1], // Name
  [hasAt, -4], // Email
  [hasParenthesis, -3], // Phone
  [hasComma, -4], // Location
  [has4OrMoreWords, -4], // Summary
];

// Summary -> has 4 or more words
const SUMMARY_FEATURE_SETS: FeatureSet[] = [
  [has4OrMoreWords, 4],
  [isBold, -1], // Name
  [hasAt, -4], // Email
  [hasParenthesis, -3], // Phone
  [matchCityAndState, -4, false], // Location
];

/**
 * Sanitizes profile fields to remove common extraction artifacts
 */
const sanitizeProfileFields = (profile: {
  name: string;
  email: string;
  phone: string;
  location: string;
  url: string;
  summary: string;
}) => {
  // Clean up email - remove any invalid prefixes like #
  if (profile.email) {
    profile.email = profile.email.replace(/^[^a-zA-Z0-9]+/, '');
  }

  // Clean up URL - remove any invalid prefixes like ï
  if (profile.url) {
    profile.url = profile.url.replace(/^[^a-zA-Z0-9:]+/, '');
    // If URL doesn't start with http or www, add https://
    if (!profile.url.match(/^(https?:\/\/|www\.)/)) {
      profile.url = 'https://' + profile.url;
    }
  }

  // Improved phone number sanitization
  if (profile.phone) {
    // Keep only digits, plus signs, parentheses, and hyphens
    let phone = profile.phone.replace(/[^\d\+\(\)\-\s\.]/g, '');
    
    // Extract all digits from the phone number
    const digits = phone.replace(/\D/g, '');
    
    // Check if original had plus sign
    const hasPlus = phone.includes('+');
    
    // Check if phone has proper format already
    if (digits.length >= 10) {
      // Format based on digit count (using the specified format)
      if (digits.length === 10) {
        // Format: first 5 digits, then next 5 digits
        phone = `${digits.substring(0, 5)} ${digits.substring(5)}`;
      } else if (digits.length > 10) {
        // Format: country code with plus sign, space, first 5 digits, space, remaining digits
        const countryCode = digits.substring(0, digits.length - 10);
        const remaining = digits.substring(digits.length - 10);
        phone = `+${countryCode} ${remaining.substring(0, 5)} ${remaining.substring(5)}`;
      }
    }
    
    profile.phone = phone;
  }

  return profile;
};

export const extractProfile = (sections: ResumeSectionToLines) => {
  const lines = sections.profile || [];
  const textItems = lines.flat();

  const [name, nameScores] = getTextWithHighestFeatureScore(
    textItems,
    NAME_FEATURE_SETS
  );
  const [email, emailScores] = getTextWithHighestFeatureScore(
    textItems,
    EMAIL_FEATURE_SETS
  );
  const [phone, phoneScores] = getTextWithHighestFeatureScore(
    textItems,
    PHONE_FEATURE_SETS
  );
  const [location, locationScores] = getTextWithHighestFeatureScore(
    textItems,
    LOCATION_FEATURE_SETS
  );
  const [url, urlScores] = getTextWithHighestFeatureScore(
    textItems,
    URL_FEATURE_SETS
  );
  const [summary, summaryScores] = getTextWithHighestFeatureScore(
    textItems,
    SUMMARY_FEATURE_SETS,
    undefined,
    true
  );

  const summaryLines = getSectionLinesByKeywords(sections, ["summary"]);
  const summarySection = summaryLines
    .flat()
    .map((textItem) => textItem.text)
    .join(" ");
  const objectiveLines = getSectionLinesByKeywords(sections, ["objective"]);
  const objectiveSection = objectiveLines
    .flat()
    .map((textItem) => textItem.text)
    .join(" ");

  // Create the profile object
  const profileData = {
    name,
    email,
    phone,
    location,
    url,
    // Dedicated section takes higher precedence over profile summary
    summary: summarySection || objectiveSection || summary,
  };

  // Apply sanitization to clean up the profile fields
  const sanitizedProfile = sanitizeProfileFields(profileData);

  return {
    profile: sanitizedProfile,
    // For debugging
    profileScores: {
      name: nameScores,
      email: emailScores,
      phone: phoneScores,
      location: locationScores,
      url: urlScores,
      summary: summaryScores,
    },
  };
};
