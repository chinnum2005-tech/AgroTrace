import api from './api';

export interface Field {
  id: string;
  name: string;
  polygon?: any;
  soilType?: string;
  lastSoilTestAt?: string;
  soilReadings?: any[];
  weatherSnapshots?: any[];
}

export const getMyFields = async (): Promise<Field[]> => {
  const response = await api.get('/fields');
  return response.data.data.fields;
};

export const createField = async (name: string, polygon: any): Promise<Field> => {
  const response = await api.post('/fields', { name, polygon });
  return response.data.data.field;
};

export const addSoilData = async (fieldId: string, soilData: { N: number; P: number; K: number; pH: number }) => {
  const response = await api.post(`/fields/${fieldId}/soil`, soilData);
  return response.data.data;
};
