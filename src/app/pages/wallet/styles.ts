import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: #f9f9f9;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export const ButtonContainer = styled.View`
  width: 100%;
  margin-top: 20px;
  align-items: center;
`;

export const StyledButton = styled.TouchableOpacity<{ primary?: boolean }>`
  width: 90%;
  padding: 15px;
  background-color: ${props => (props.primary ? '#004aad' : '#4caf50')};
  border-radius: 10px;
  margin-bottom: 15px;
  align-items: center;
`;

export const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;
