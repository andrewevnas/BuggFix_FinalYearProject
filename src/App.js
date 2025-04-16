import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomeScreen } from "./screens/homeScreen";
import { WorkspaceScreen } from "./screens/workspaceScreen";
import AuthScreen from "./screens/authScreen";
import { WorkspaceProvider } from "./providers/workspaceProvider";
import { ModalProvider } from "./providers/modalProvider";
import { AuthProvider } from "./providers/authProvider";
import SyncNotification from "./components/SyncNotification";

import { AccountScreen } from "./screens/accountScreen";

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ModalProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/workspace/:fileId/:folderId" element={<WorkspaceScreen />} />
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/account" element={<AccountScreen />} />
            </Routes>
            <SyncNotification />
          </BrowserRouter>
        </ModalProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;