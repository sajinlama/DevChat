import React, { useState, useEffect } from "react";
import { executeCode } from "../api";
import { FaPlay, FaSpinner, FaTerminal, FaExclamationTriangle, FaLock } from "react-icons/fa";
import { useSocket } from "@/contextApi/Context";

interface CodeOutputProps {
  language: string;
  sourceCode: string;
  isHost: boolean;
  roomId: string;
}

const CodeOutput: React.FC<CodeOutputProps> = ({ language, sourceCode, isHost, roomId }) => {
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const socket = useSocket();

  useEffect(() => {
    // Listen for output code updates
    socket.on("updateOutputCode", (data) => {
      console.log("Received output update:", data);
      setOutput(data);
      setError(data.toLowerCase().includes("error") || data.toLowerCase().includes("exception"));
    });

    // Clean up the event listener when component unmounts
    return () => {
      socket.off("updateOutputCode");
    };
  }, [socket]);

  const handleRunCode = async () => {
    // Verify host status before running code
    if (!isHost) {
      console.log("Non-host attempting to run code");
      socket.emit("checkHostStatus", { roomId });
      return;
    }

    console.log("Host running code");
    
    if (!sourceCode) {
      const errorMsg = "Error: No code to execute.";
      console.error(errorMsg);
      setOutput(errorMsg);
      setError(true);
      // Share this error with others in the room
      socket.emit("outputCode", { roomId, output: errorMsg });
      return;
    }

    setLoading(true);
    setError(false);

    try {
      // First, update local state to show "Running..." to the current user
      const runningMsg = "Running code...";
      console.log(runningMsg);
      setOutput(runningMsg);
      // Share this status with others
      socket.emit("outputCode", { roomId, output: runningMsg });

      // Execute the code
      const response = await executeCode(language, sourceCode);
      console.log("API Response:", response);

      if (!response) {
        throw new Error("API returned null. Check the request.");
      }

      if (!response.run) {
        throw new Error("Invalid API response format. Missing 'run' key.");
      }

      const outputText = response.run.output || response.run.stdout || "No output received.";
      console.log("Output:", outputText);

      // Update local state
      setOutput(outputText);
      setError(outputText.toLowerCase().includes("error") || outputText.toLowerCase().includes("exception"));

      // Share with others in the room
      socket.emit("outputCode", { roomId, output: outputText });
    } catch (error) {
      console.error("Execution error:", error);
      const errorMessage = `Execution failed: ${error.message}`;
      setOutput(errorMessage);
      setError(true);
      // Share the error with others
      socket.emit("outputCode", { roomId, output: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-72 bg-gray-900 h-[calc(100vh-4rem)] shadow-lg overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaTerminal className="text-green-400" />
          <h2 className="text-white font-bold">Code Output</h2>
        </div>
        <div className="text-xs px-2 py-1 rounded bg-gray-600 text-gray-200">
          {language}
        </div>
      </div>

      {/* Run Button */}
      <div className="px-4 py-3 border-b border-gray-700">
        <button
          onClick={handleRunCode}
          disabled={loading || !isHost}
          className={`w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 font-medium transition-colors ${
            loading
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : isHost
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Executing...
            </>
          ) : isHost ? (
            <>
              <FaPlay />
              Run {language} Code
            </>
          ) : (
            <>
              <FaLock />
              Only Host Can Run Code
            </>
          )}
        </button>
      </div>

      {/* Output Display */}
      <div className="p-4">
        <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Output Console
        </div>

        {output ? (
          <div
            className={`bg-gray-950 rounded-md p-3 font-mono text-sm overflow-auto max-h-64 border ${
              error ? "border-red-700" : "border-gray-700"
            }`}
          >
            {error && (
              <div className="flex items-center gap-2 text-red-400 mb-2 pb-2 border-b border-gray-700">
                <FaExclamationTriangle />
                <span>Execution encountered errors</span>
              </div>
            )}
            <pre className={`whitespace-pre-wrap ${error ? "text-red-400" : "text-green-400"}`}>
              {output}
            </pre>
          </div>
        ) : (
          <div className="bg-gray-950 rounded-md p-4 text-center text-gray-500 border border-gray-800">
            <FaTerminal className="mx-auto mb-2 text-2xl" />
            <p className="text-sm">Run your code to see output here</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 px-3 py-2 text-xs text-gray-400 flex justify-between items-center">
        <span>{loading ? "Executing..." : "Ready"}</span>
        {output && !loading && (
          <span>
            {new Date().toLocaleTimeString()} • {output.length} characters
          </span>
        )}
      </div>
    </div>
  );
};

export default CodeOutput;