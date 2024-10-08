import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #f0f0f5;
`;

export const FolderItem = styled(TouchableOpacity)`
  flex: 1; 
  align-items: center; 
  margin: 5px; 
  height: 100px; 
  background-color: #f0f0f5; 
  justify-content: center; 
  border-radius: 10px; 
  elevation: 2; 
`;

export const FolderName = styled.Text`
  margin-top: 8px;
  font-size: 16px;
`;

export const ErrorText = styled.Text`
  color: red;
  text-align: center;
  margin-top: 20px;
`;
