import { UserProvider } from "./context/User.context";
import Approutes from "./routes/Approutes";

function App() {
  return (
    <UserProvider>
      <Approutes />
    </UserProvider>
  );
}

export default App;
