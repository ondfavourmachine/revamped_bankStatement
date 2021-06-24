export interface TransactionHistory {
  completed?: boolean;
  transactions?: Array<Transactions>;
}

export interface Transactions {
  transaction_id: string;
  file_url_remote: string;
  summary: Record<any, any>;
  analytics_score: number;
  date: string;
}
