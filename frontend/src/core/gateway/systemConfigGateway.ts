import { httpClient } from '../api/client';

export const MENTEE_POLICY_CONFIG_KEY = 'mentee_policy';

export interface PolicySection {
  title: string;
  items: string[];
}

export interface PolicyConfigValue {
  type: string;
  title: string;
  version: string;
  effectiveDate: string;
  subtitle?: string;
  acknowledgement?: string;
  supportEmail?: string;
  websiteUrl?: string;
  sections: PolicySection[];
}

export interface SystemConfigRecord<T = any> {
  id: string;
  configKey: string;
  configValue: T;
  description?: string | null;
  status: string;
}

export const systemConfigGateway = {
  async getPublicByKey<T = any>(key: string): Promise<SystemConfigRecord<T>> {
    const res = await httpClient.get<any>(`/v1/system-configs/public/${key}`);
    return res?.data?.[0] || res;
  },

  async getAll(): Promise<SystemConfigRecord[]> {
    const res = await httpClient.get<any>('/v1/system-configs');
    return res?.data || [];
  },

  async create(payload: {
    configKey: string;
    configValue: any;
    description?: string;
    status?: string;
  }): Promise<SystemConfigRecord> {
    const res = await httpClient.post<any>('/v1/system-configs', payload);
    return res?.data?.[0] || res;
  },

  async update(
    id: string,
    payload: {
      configValue?: any;
      description?: string;
      status?: string;
    },
  ): Promise<SystemConfigRecord> {
    const res = await httpClient.patch<any>(`/v1/system-configs/${id}`, payload);
    return res?.data?.[0] || res;
  },
};
