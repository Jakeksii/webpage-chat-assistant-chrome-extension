import { Box, Button, Card, Container, InputAdornment, Stack, styled, TextField } from "@mui/material";
import parse from 'html-react-parser';
import { marked } from "marked";
import { useEffect, useRef, useState } from "react";
import { useIndexedDB } from "./DB";
import storage from "./Storage";

const StyledMessage = styled("div")(({ theme }) => ({
  "*": {
    marginBlock: 0,
    padding: 0,
    boxSizing: "border-box",
  },
  "& p": { ...theme.typography.body1 },
  "& h1": { ...theme.typography.h1 },
  "& h2": { ...theme.typography.h2 },
  "& h3": { ...theme.typography.h3 },
  "& h4": { ...theme.typography.h4 },
  "& h5": { ...theme.typography.h5 },
  "& h6": { ...theme.typography.h6 },
  "& ul, & ol": {
    paddingLeft: 50,
  },
}));

export default function Chat({ pageContent }) {
  const db = useIndexedDB();
  const settings = storage.get();
  const messages = db.messages;
  const [input, setInput] = useState(""); // User input
  const [isStreaming, setIsStreaming] = useState(false); // Streaming status
  const [streamedMessage, setStreamedMessage] = useState(""); // Current streaming message
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to the bottom of the chat
  if (isStreaming && chatContainerRef.current) {
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    // Scroll to the bottom of the chat on messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }

    // Focus on the input field
    inputRef?.current.focus();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to the chat
    const userMessage = { role: "user", content: input };
    await db.add(userMessage);
    setInput(""); // Clear input field

    // Prepare to stream the assistant's response
    setStreamedMessage(""); // Clear current streamed message
    setIsStreaming(true);

    const context = {
      role: "system",
      content: `You are discussing a website content: ${pageContent}`
    }

    // OpenAI API request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model || "gpt-3.5-turbo",
        messages: [context, ...messages, userMessage],
        stream: true,
      }),
    });

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    let assistantMessage = "";

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk
        .split("\n")
        .filter((line) => line.trim().startsWith("data: "))
        .map((line) => line.replace("data: ", "").trim());

      for (const line of lines) {
        if (line === "[DONE]") break;

        try {
          const json = JSON.parse(line);
          const token = json.choices[0]?.delta?.content || "";
          assistantMessage += token;
          setStreamedMessage(assistantMessage);
        } catch (error) {
          console.error("Error parsing line:", line, error);
        }
      }
    }

    // Finalize the message
    setStreamedMessage("");
    setIsStreaming(false);
    await db.add({ role: "assistant", content: assistantMessage });
  };

  return (
    <Container>
      <Box
        ref={chatContainerRef}
        sx={{ overflowY: "auto", height: "70vh", gap: 2 }}
        className="custom-scrollbar"
      >
        <Stack sx={{ gap: 2, pb: 2 }}>
          {messages.map((msg, index) => (
            <Card
              key={index}
              className="custom-scrollbar"
              sx={{
                padding: 1,
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.role === "user" ? "#f0f0f0" : "#e0e0e0",
                m: msg.role === "user" ? "0 10px 0 40px" : "0 40px 0 10px",
                maxWidth: '-webkit-fill-available',
                overflowX: 'auto',
              }}
              elevation={0}
            >
              {
                <StyledMessage>{parse(marked.parse(msg.content))}</StyledMessage>
              }
            </Card>
          ))}
          {isStreaming && (
            <Card
              sx={{
                padding: 1,
                alignSelf: "flex-start",
                backgroundColor: "#e0e0e0",
                m: "0 40px 0 10px",
              }}
              elevation={0}
            >
              {
                <StyledMessage>{parse(marked.parse(streamedMessage))}</StyledMessage>
              }
            </Card>
          )}
        </Stack>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack direction="row" spacing={2}>
          <TextField
            autoFocus
            variant="outlined"
            placeholder="Type your prompt here"
            multiline
            fullWidth
            onKeyDownCapture={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit(e)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!settings.apiKey || settings.apiKey === "" || isStreaming}
            inputRef={inputRef}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end" sx={{ alignSelf: 'end' }}>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={isStreaming || !input}
                    >Send</Button>
                  </InputAdornment>
                )
              }
            }}
          />
        </Stack>
      </form>
    </Container>
  );
};