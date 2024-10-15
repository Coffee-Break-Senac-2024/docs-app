import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f5;
  padding: 20px;
`;

export const LogoContainer = styled.View`
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
`;

export const Logo = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  margin-bottom: 20px;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
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

export const ErrorText = styled.Text`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
`;

export const LoginButton = styled.Pressable`
  width: 100%;
  padding: 15px;
  background-color: ${props => (props.disabled ? '#aaa' : '#004aad')};
  border-radius: 25px;
  align-items: center;
  margin-top: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  elevation: 5;
`;

export const ButtonText = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;

export const ForgotPasswordButton = styled.Pressable`
  margin-top: 15px;
`;

export const ForgotPasswordText = styled.Text`
  color: #007bff;
  font-size: 14px;
`;

export const SignUpButton = styled.Pressable`
  margin-top: 20px;
`;

export const SignUpText = styled.Text`
  color: #007bff;
  font-size: 14px;
  text-align: center;
`;
