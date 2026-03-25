export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type Plan = "starter" | "growth" | "pro" | "enterprise";

export type ParticipantStatus = "active" | "completed";

export type TemplateFormat =
  | "square_1x1"
  | "story_9x16"
  | "landscape_16x9"
  | "linkedin_banner";

export type FieldType = "text" | "image" | "textarea";

export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  generations_limit: number;
  generations_used: number;
  billing_cycle_start: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  locale: string;
  branding: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    cover_url?: string;
  };
  access_password: string | null;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface ParticipantCategory {
  id: string;
  event_id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface VariableFieldDefinition {
  id: string;
  event_id: string;
  name: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  sort_order: number;
  created_at: string;
}

export interface Template {
  id: string;
  event_id: string;
  name: string;
  format: TemplateFormat;
  width: number;
  height: number;
  canvas_json: Record<string, unknown>;
  thumbnail_url: string | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  event_id: string;
  category_id: string;
  email: string;
  status: ParticipantStatus;
  field_values: Record<string, string>;
  gdpr_consent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  participant_id: string | null;
  template_id: string;
  organization_id: string;
  file_url: string | null;
  file_format: "png" | "jpeg";
  status: GenerationStatus;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}
