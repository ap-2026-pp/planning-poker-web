export type Issue = {
  id: string;
  gameId: string;
  code: string;
  url?: string | null;
  title: string;
  description: string;
  order: number;
  isCurrent: boolean;
  isRemoved: boolean;
  createdAt: string;
  finalEstimate?: string | null;
  status?: string | null;
};

export type IssueDetails = {
  id: string;
  code: string;
  title: string;
  url?: string | null;
  description?: string | null;
  finalEstimate?: string | null;
  isCurrent: boolean;
};

export type ImportPlaneIssuesPayload = {
  apiKey: string;
  projectUrl: string;
};

export type ExportIssuesRequestDto = {
  summaryColumnName?: string;
  keyColumnName?: string;
  descriptionColumnName?: string;
  linkColumnName?: string;
  estimateColumnName?: string;
};

