import Footer from './Footer';
import Navbar from './Navbar';

const ClientLayout = ({ children }) => {
  return (
    <div className="client-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
