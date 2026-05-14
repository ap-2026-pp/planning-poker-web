export enum IssueStatus {
  Pending = 0,
  Voting = 1,
  Completed = 2,
}

export type Issue = {
  id: string;
  gameId?: string;
  code?: string | null;
  url?: string | null;
  title: string;
  description?: string | null;
  order: number;
  isCurrent: boolean;
  isRemoved: boolean;
  finalEstimate?: string | null;
  status: IssueStatus;
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

