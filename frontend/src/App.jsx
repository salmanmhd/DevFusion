import { UserProvider } from "./context/user.context";
import Approutes from "./routes/Approutes";

function App() {
  return (
    <UserProvider>
      <Approutes />
    </UserProvider>
  );
}

export default App;
