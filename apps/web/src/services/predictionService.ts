import api from './api';

export const predictionService = {
  predictYield: (cropId: string) => 
    api.post(`/predict/crop/${cropId}`),

  recommendCropForField: (fieldId: string) => 
    api.post(`/predict/recommend/field/${fieldId}`),
};
