import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f5;
  padding: 20px;
`;


export const Input = styled.TextInput`
  width: 100%;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff;
  border-radius: 25px;
  border-color: #ddd;
  border-width: 1px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  elevation: 3;
`;

export const ButtonText = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;

export const RegisterButton = styled.Pressable`
  width: 100%;
  padding: 15px;
  background-color: #004aad;
  border-radius: 25px;
  align-items: center;
  margin-top: 20px;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
`;

export const ErrorText = styled.Text`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
`;
