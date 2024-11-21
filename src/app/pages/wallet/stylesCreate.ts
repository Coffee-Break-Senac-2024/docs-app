import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: #f9f9f9;
  padding: 20px;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: #004aad;
`;

export const FormContainer = styled.View`
  margin-top: 10px;
`;

export const Label = styled.Text`
  font-size: 16px;
  color: #555;
  margin-bottom: 5px;
`;

export const Input = styled.TextInput`
  height: 48px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 15px;
  background-color: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  elevation: 2; /* Para sombra no Android */
`;

export const ButtonContainer = styled.View`
  margin-top: 20px;
  align-items: center;
`;

export const StyledButton = styled.TouchableOpacity<{ primary?: boolean }>`
  width: 90%;
  padding: 15px;
  background-color: ${(props) => (props.primary ? '#004aad' : '#4caf50')};
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  elevation: 3; /* Para Android */
`;

export const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

export const FileName = styled.Text`
  font-size: 16px;
  color: #333;
  margin-top: 10px;
  text-align: center;
  font-style: italic;
`;
