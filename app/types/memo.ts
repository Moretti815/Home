/**
 * Memos 数据类型定义
 */

export interface MemoAttachment {
  name: string;
  filename: string;
  type: string;
  size: string;
  memo: string;
}

export interface MemoLocation {
  placeholder: string;
  latitude: number;
  longitude: number;
}

export interface MemoProperty {
  hasLink: boolean;
  hasTaskList: boolean;
  hasCode: boolean;
  hasIncompleteTasks: boolean;
}

export interface Memo {
  name: string;
  state: string;
  creator: string;
  createTime: string;
  updateTime: string;
  displayTime: string;
  content: string;
  visibility: string;
  tags: string[];
  pinned: boolean;
  attachments: MemoAttachment[];
  relations: unknown[];
  reactions: unknown[];
  property: MemoProperty;
  snippet: string;
  location?: MemoLocation;
}

export interface MemosResponse {
  memos: Memo[];
  nextPageToken: string;
}

export interface FilterTab {
  value: string;
  label: string;
  icon?: string;
  count?: number;
}
