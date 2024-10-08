import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f5;
  padding: 20px;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

export const Description = styled.Text`
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
`;

export const Card = styled.View`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  height: 200px; 
  width: 100%; 
  align-items: center;
  justify-content: center;
  margin-bottom: 15px; 
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 3.5;
  shadow-offset: 0 2px; /* Corrigido */
  elevation: 5; /* Para Android */
`;

export const CardTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #004aad;
  margin-bottom: 10px;
`;

export const CardDescription = styled.Text`
  font-size: 16px;
  color: #666;
  text-align: center;
`;
