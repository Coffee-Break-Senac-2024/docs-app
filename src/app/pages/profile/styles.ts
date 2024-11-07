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
  margin-bottom: 20px;
  text-align: center;
`;

export const Button = styled.TouchableOpacity`
  background-color: #004aad;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 10px;
  width: 100%;
  align-items: center;
`;

export const ButtonText = styled.Text`
  color: white;
  font-size: 18px;
`;

export const InfoBox = styled.View`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  width: 100%;
  margin-bottom: 20px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 5;
`;

export const StyledLabel = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #555;
  margin-top: 10px;
`;

export const StyledValue = styled.Text`
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
  padding-left: 5px;
`;
