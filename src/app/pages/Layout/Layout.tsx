import React from 'react';
import Header from '../../components/Header/Header'; 
import { Container, Content } from './styles';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <Container>
      <Header title={title} />
      <Content>{children}</Content>
    </Container>
  );
};

export default Layout;
