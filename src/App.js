import Dashboard from "./dashboard";
import { SocketContext, socket } from "./SocketContext";
import "./App.css";

const App = () => {
  return (
    <SocketContext.Provider value={socket}>
      <Dashboard />
    </SocketContext.Provider>
  );
};

export default App;
