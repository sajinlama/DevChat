import { io, Socket } from "socket.io-client";
import { createContext, useState, useEffect, ReactNode, useContext } from "react";

// Create socket context
const socketContext = createContext<Socket | null>(null);

// SocketProvider component to manage socket connection and provide context
export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketConnection = io("http://localhost:3000");
    setSocket(socketConnection);

    socketConnection.on("connection", () => {
      console.log("connected");
    });

    socketConnection.on("message", (data: string) => {
      console.log(data);
    });

    // Cleanup on unmount
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  return (
    <socketContext.Provider value={socket}>
      {children}
    </socketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  return useContext(socketContext);
};
