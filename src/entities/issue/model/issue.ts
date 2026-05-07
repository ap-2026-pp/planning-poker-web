export type Issue = {
  id: string;
  code: string;
  title: string;
  description: string;
  order: number;
  isCurrent: boolean;
  finalEstimate?: string | null;
  status?: string | null;
};

export type IssueDetails = {
  id: string;
  code: string;
  title: string;
  link?: string | null;
  description?: string | null;
  finalEstimate?: string | null;
  isCurrent: boolean;
};
