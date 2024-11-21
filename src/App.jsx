import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Container, SpeedDial, SpeedDialAction } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { useEffect, useState, } from "react";
import Chat from "./Chat";
import { useIndexedDB } from "./DB";
import Settings from './Settings';
import storage from "./Storage";

function App() {
  const db = useIndexedDB()
  const settings = storage.get()
  const [settingsOpen, setSettingsOpen] = useState(
    Boolean(!settings.apiKey)
  );
  const [pageContent, setPageContent] = useState("");

  useEffect(() => {
    async function init() {
      if (chrome?.tabs?.query) {
        // extract website content
        await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { message: "extract_content" }, (response) => {
            if (response && response.content) {
              setPageContent(response.content);
            }
          });
        });
      }
    }
    init();
  }, []);

  const clearMessages = () => {
    db.clear();
  };

  return (
    <Container className="App" maxWidth="md" sx={{ m: 'auto', py: 4 }}>
      <CssBaseline />
      <Box sx={{ pb: 6 }}>
        <SpeedDial
          ariaLabel='Settings'
          direction='down'
          sx={{ position: 'absolute', left: 50, top: 20 }}
          icon={<SettingsIcon />}
        >
          <SpeedDialAction
            onClick={clearMessages}
            tooltipTitle="Clear messages"
            icon={<DeleteIcon />}
          />
          <SpeedDialAction
            onClick={() => setSettingsOpen(true)}
            tooltipTitle="Settings"
            icon={<SettingsIcon />}
          />
        </SpeedDial>
      </Box>
      <Settings open={settingsOpen} setOpen={setSettingsOpen} />
      <Chat pageContent={pageContent} clearMessages={clearMessages} />
    </Container>
  );
}

export default App;