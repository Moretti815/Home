/**
 * TGTalk 数据类型定义
 */

export interface TGTalkItem {
  id: string;
  text: string;
  image: string[];
  time: number;
  views: string;
}

export interface TGTalkResponse {
  success: boolean;
  nextBefore: number;
  version: string;
  data: TGTalkItem[];
  count: number;
}

export interface FilterTab {
  value: string;
  label: string;
  icon?: string;
  count?: number;
}
