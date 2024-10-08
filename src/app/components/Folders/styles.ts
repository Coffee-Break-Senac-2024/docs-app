import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  padding: 10px;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start; 
`;

export const FolderItem = styled.View`
  width: 100px; 
  height: 100px; 
  background-color: #e0e0e0; 
  border-radius: 10px; 
  align-items: center; 
  justify-content: center; 
  margin: 5px; 
`;

export const FolderName = styled.Text`
  font-size: 16px;
  text-align: center; 
`;

export const ErrorText = styled.Text`
  color: red;
  text-align: center;
  margin-top: 20px;
`;
