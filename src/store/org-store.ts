import { create } from "zustand";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  plan: string;
  generations_limit: number;
  generations_used: number;
}

interface OrgStore {
  org: Organization | null;
  setOrg: (org: Organization | null) => void;
}

export const useOrgStore = create<OrgStore>((set) => ({
  org: null,
  setOrg: (org) => set({ org }),
}));
