import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: #f9f9f9;
  justify-content: center;
`;

export const FormContainer = styled.View`
  padding: 20px;
`;

export const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
`;

export const Description = styled.Text`
  font-size: 18px;
  color: #777;
  text-align: center;
  margin-bottom: 30px;
`;

export const Input = styled.TextInput`
  height: 48px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 15px;
  background-color: #fff;
`;

export const Label = styled.Text`
  font-size: 16px;
  color: #555;
  margin-bottom: 8px;
`;

export const ButtonContainer = styled.View`
  margin-top: 20px;
  align-items: center;
`;

export const StyledButton = styled.TouchableOpacity`
  width: 90%;
  padding: 15px;
  background-color: ${props => (props.primary ? '#4CAF50' : '#007BFF')};
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`;

export const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

export const FileName = styled.Text`
  font-size: 16px;
  color: #4CAF50;
  margin-top: 10px;
  text-align: center;
  font-style: italic;
`;
