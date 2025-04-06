import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomeScreen } from "./screens/homeScreen";
import { WorkspaceScreen } from "./screens/workspaceScreen";
import { WorkspaceProvider } from "./providers/workspaceProvider";
import { ModalProvider } from "./providers/modalProvider";

function App() {
  return (
    <WorkspaceProvider>
      <ModalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/workspace/:fileId/:folderId" element={<WorkspaceScreen />} />
          </Routes>
        </BrowserRouter>
      </ModalProvider>
    </WorkspaceProvider>
  );
}

export default App;
