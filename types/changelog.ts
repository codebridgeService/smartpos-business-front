export type ChangelogComponent =
  | "FRONTEND"
  | "BACKEND"
  | "DATABASE"
  | "FULL_STACK"
  | "SECURITY";

export type ChangeType =
  | "FEATURE"
  | "IMPROVEMENT"
  | "BUG_FIX"
  | "BREAKING_CHANGE"
  | "SECURITY_UPDATE"
  | "MAINTENANCE";

export interface SystemChangelog {
  id: number;
  version: string;
  title: string;
  component: ChangelogComponent;
  change_type: ChangeType;
  summary: string;
  changes_list?: string[];
  author_name: string;
  author_email?: string;
  is_published: boolean;
  release_notes_url?: string;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateChangelogPayload {
  version: string;
  title: string;
  component: ChangelogComponent;
  change_type: ChangeType;
  summary: string;
  changes_list?: string[];
  author_name?: string;
  author_email?: string;
  is_published?: boolean;
  release_notes_url?: string;
  published_at?: string;
}

export type UpdateChangelogPayload = Partial<CreateChangelogPayload>;

