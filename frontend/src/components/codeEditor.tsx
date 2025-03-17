import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { CODE_SNIPPETS } from "../constant";
import CodeOutput from "./codeOutput";
import { useSocket } from "@/contextApi/Context";

interface CodeEditorProps {
  language: keyof typeof CODE_SNIPPETS;
  roomId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, roomId }) => {
  const [code, setCode] = useState(CODE_SNIPPETS[language]);
  const [isHost, setIsHost] = useState(false);
  const editorRef = useRef<any>(null);
  const socket = useSocket();
  
  useEffect(() => {
    setCode(CODE_SNIPPETS[language]);
  }, [language]);

  useEffect(() => {
    // Check if this user is the host when component mounts
    if (roomId) {
      socket.emit("checkHostStatus", { roomId });
    }
    
    // Listen for host status updates
    socket.on("hostStatus", (status) => {
      console.log("Received host status:", status.isHost);
      console.log("hello sajin is host");
      setIsHost(status.isHost);
      
      // Update editor read-only status if editor is mounted
      if (editorRef.current) {
        editorRef.current.updateOptions({ readOnly: !status.isHost });
      }
    });
    
    // Listen for code changes from host
    socket.on("codeChange", (newCode) => {
      console.log("Received code update");
      setCode(newCode);
    });
    
    // Listen for userList updates (which include host status)
    socket.on("userList", (users) => {
      console.log("Updated user list:", users);
      // Find myself in the list and check if I'm the host
      const userId = socket.id; // This assumes socket.id is your user ID
      const myUser = users.find((user: any) => user.id === userId);
      if (myUser && myUser.isHost !== undefined) {
        console.log("Setting host status from user list:", myUser.isHost);
        setIsHost(myUser.isHost);
      }
    });
    
    // Re-check host status periodically
    const intervalId = setInterval(() => {
      if (roomId) {
        socket.emit("checkHostStatus", { roomId });
      }
    }, 5000); // Check every 5 seconds
    
    // Clean up the event listeners when component unmounts
    return () => {
      socket.off("codeChange");
      socket.off("hostStatus");
      socket.off("userList");
      clearInterval(intervalId);
    };
  }, [socket, roomId]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    console.log("ehllo")
    
    // Set read-only status based on host status
    editorRef.current.updateOptions({ readOnly: !isHost });
    
    if (isHost) {
      console.log("i am host");
      editor.focus();
    }

    // Double-check host status when editor mounts
    if (roomId) {
      socket.emit("checkHostStatus", { roomId });
    }
  };

  const handleCodeChange = (newValue: string | undefined) => {
    if (!isHost) {
      console.log("Non-host trying to change code, ignoring");
      return; // Only host can change code
    }
    
    console.log("Host changing code");
    const updatedCode = newValue || "";
    setCode(updatedCode);
    
    // Emit the code change to all users in the room
    socket.emit("codeChange", { roomId, code: updatedCode });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full">
      {/* Status banner - separate div outside of editor */}
      <div className={`py-2 px-4 ${isHost ? 'bg-green-800 text-white' : 'bg-gray-800 text-amber-400'} text-sm w-full`}>
        {isHost ? (
          <span>Host mode: You can edit and run the code</span>
        ) : (
          <span>Read-only mode: Only the host can edit the code</span>
        )}
      </div>
      
      {/* Main content area with editor and output side by side */}
      <div className="flex flex-row w-full flex-1">
        {/* Editor container */}
        <div className="w-1/2 h-full">
          <Editor
            language={language}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              readOnly: !isHost,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
            className="w-full h-full"
          />
        </div>
        
        {/* Code output container */}
        <div className="w-1/2 h-full">
          <CodeOutput language={language} sourceCode={code} isHost={isHost} roomId={roomId} />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;