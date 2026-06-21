export type IStatus = "open" | "closed" | "in_progress";

export interface IIssue {
  title: string;
  description: string;
  type?: string;
  status?: IStatus;
  reporter_id?: number;
}

export interface IIssueUpdate {
  title?: string;
  description?: string;
  type?: string;
}

export interface IIssuestatus {
  status?: IStatus;
}