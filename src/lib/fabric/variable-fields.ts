/**
 * Custom Fabric.js properties for variable zones.
 * When a canvas object has `variableField` set, it becomes editable
 * by participants. The value is the field `name` from variable_field_definitions.
 */

export const VARIABLE_FIELD_PROPERTY = "variableField";

export const CUSTOM_PROPERTIES = [VARIABLE_FIELD_PROPERTY, "id", "imageFitMode", "locked"];

/**
 * Placeholder text shown in the editor for variable zones.
 */
export function getPlaceholderText(fieldName: string): string {
  const placeholders: Record<string, string> = {
    first_name: "Prénom",
    last_name: "Nom",
    company: "Entreprise",
    job_title: "Fonction",
    stand_number: "Stand N°",
    bio: "Biographie...",
    social_twitter: "@twitter",
    social_linkedin: "linkedin.com/in/...",
  };
  return placeholders[fieldName] ?? `{{${fieldName}}}`;
}
