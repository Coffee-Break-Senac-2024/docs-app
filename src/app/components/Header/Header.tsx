import React from 'react';
import { Header as StyledHeader, Title } from './styles';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <StyledHeader>
      <Title>{title}</Title>
    </StyledHeader>
  );
};

export default Header;
