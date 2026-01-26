import MainLayout from './components/layouts/MainLayout';
import ClientList from './components/ClientList';

function App() {
  return (
    <MainLayout 
      activePageLabel="Mes Clients" 
      headerSection="Coach" 
      headerSubSection="Annuaire Clients"
    >
      <ClientList />
    </MainLayout>
  );
}

export default App;