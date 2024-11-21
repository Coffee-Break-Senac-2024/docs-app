import withAutoReload from '../../components/withAutoReload';
import FolderList from '../../components/Folders/FolderList';
import Layout from '../../pages/Layout/Layout';

const Home: React.FC = () => (
  <Layout title="Bem-vindo!">
    <FolderList />
  </Layout>
);

export default withAutoReload(Home);
