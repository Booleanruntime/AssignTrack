import Sidebar from './Sidebar';
import TopBar from './TopBar';

// Shared chrome for every authenticated screen: fixed sidebar on the left,
// sticky top bar, and the page rendered into the scrollable main area.
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 w-full max-w-container-max mx-auto p-lg md:p-xl">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
