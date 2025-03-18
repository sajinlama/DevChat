import { useSocket } from "@/contextApi/Context";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBackCircle } from "react-icons/io5";
import { FaCopy, FaCheck, FaUsers, FaCommentAlt, FaSignOutAlt, FaCrown } from "react-icons/fa";

// Define proper types for messages
type MessageType = {
  id: string;
  text: string;
  senderId?: string;
  senderName?: string;
  type: "system" | "user";
  timestamp: string;
};

// Define user type
type UserType = {
  id: string;
  name: string;
  isHost?: boolean;
};

export default function RoomSidebar() {
  const [users, setUsers] = useState<UserType[]>([]);
  const socket = useSocket();
  const [showMessageView, setShowMessageView] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { roomId } = useParams();
  const [userId, setUserId] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const navigate = useNavigate();

  const handleMessageButtonClick = () => {
    setShowMessageView(true);
    setUnreadCount(0); // Reset unread count when opening messages
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;
    console.log("Sending message:", inputMessage);

    // Emit the message to the server
    socket?.emit("messageUser", { roomId, inputMessage });
    setInputMessage("");

    // Reset input field height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    }
  };

  const handleLeaveRoom = () => {
    socket?.emit("leaveRoom", { roomId, userId });
    navigate("/"); // Navigate to home page or lobby
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set up user ID and host status listeners
  useEffect(() => {
    if (!socket) return;

    socket?.on("userId", (data) => {
      console.log("My user ID:", data.userId);
      setUserId(data.userId);
    });

    socket?.on("hostStatus", (status) => {
      console.log("Host status:", status.isHost);
      setIsHost(status.isHost);
    });

    return () => {
      socket?.off("userId");
      socket?.off("hostStatus");
    };
  }, [socket]);

  // Set up message and user list listeners
  useEffect(() => {
    if (!socket) return;

    const handleUserList = (userList: UserType[]) => {
      // Identify the host in the user list
      const hostId = userList.find((user) => user.isHost)?.id;

      // Mark the host in our local user list
      const updatedUsers = userList.map((user) => ({
        ...user,
        isHost: user.id === hostId,
      }));

      setUsers(updatedUsers);
    };

    socket?.on("userList", handleUserList);

    socket?.on("messageList", (messageData: MessageType[]) => {
      console.log("Message list received:", messageData);
      if (Array.isArray(messageData)) {
        setMessages(messageData);
      }
    });

    // Listen for new messages
    socket?.on("message", (data: MessageType) => {
      console.log("Message received:", data);
      setMessages((prevMessages) => [...prevMessages, data]);

      // Increment unread count if message view is not open
      if (!showMessageView) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      socket?.off("userList", handleUserList);
      socket?.off("messageList");
      socket?.off("message");
    };
  }, [socket, showMessageView]);

  // Add this useEffect to request the user list when the component mounts
  useEffect(() => {
    if (!socket || !roomId) return;

    // Request user list from the server
    socket?.emit("getUserList", { roomId });

    // Also request message history
    socket?.emit("getMessageList", { roomId });
  }, [socket, roomId]);

  const handleBack = () => {
    setShowMessageView(false);
  };

  // Function to dynamically resize input field
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);

    if (inputRef.current) {
      inputRef.current.style.height = "auto"; // Reset height first
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`; // Expand height dynamically
    }
  };

  // Function to format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  // Handle Enter key press to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-amber-700",
      "bg-blue-700",
      "bg-emerald-700",
      "bg-violet-700",
      "bg-rose-700",
      "bg-teal-700",
      "bg-indigo-700",
      "bg-pink-700",
      "bg-cyan-700",
    ];
    const index =
      Math.abs(name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
      colors.length;
    return colors[index];
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 h-[calc(100vh-4rem)]  w-72 flex flex-col justify-between shadow-lg">
      {!showMessageView ? (
        <>
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FaUsers className="text-amber-500" /> Room Chat
            </h1>
            {isHost && (
              <div className="mt-1 text-sm flex items-center gap-1 text-amber-400">
                <FaCrown /> You are the host
              </div>
            )}
          </div>

          {/* Connected Users Section */}
          <div className="flex-grow overflow-y-auto p-4">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="bg-green-500 h-2 w-2 rounded-full"></span>
              Connected Users ({users.length})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {users.map((user) => (
                <div
                  className="flex flex-col items-center p-2 rounded-lg bg-gray-800 bg-opacity-60 hover:bg-gray-700 transition duration-200"
                  key={user.id}
                >
                  <div className="relative">
                    <div
                      className={`flex items-center justify-center text-2xl text-white h-12 w-12 ${getAvatarColor(
                        user.name
                      )} rounded-full shadow-md`}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {user.isHost && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 shadow-md">
                        <FaCrown className="text-xs text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-white text-sm mt-2 font-medium truncate w-full text-center">
                    {user.name.length > 8
                      ? `${user.name.slice(0, 8)}...`
                      : user.name}
                    {user.id === userId && " (You)"}
                    {user.isHost && " (Host)"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Room info section */}
          <div className="px-4 mt-2">
            <div className="bg-gray-800 bg-opacity-70 p-3 rounded-lg mb-3 shadow-inner">
              <p className="text-amber-400 text-xs uppercase font-bold mb-1">
                Room ID
              </p>
              <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                <p className="text-gray-300 text-sm mr-2 overflow-hidden overflow-ellipsis flex-grow font-mono">
                  {roomId}
                </p>
                <button
                  onClick={handleCopyRoomId}
                  className="bg-gray-600 hover:bg-gray-500 p-1.5 rounded-md transition-colors"
                  title="Copy Room ID"
                >
                  {copied ? (
                    <FaCheck className="text-green-500 text-sm" />
                  ) : (
                    <FaCopy className="text-white text-sm" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Status Section */}
          {!isHost && (
            <div className="px-4">
              <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg mb-3 border border-blue-800">
                <p className="text-blue-300 text-sm">
                  <strong>Read-only mode:</strong> Only the host can edit and run
                  code
                </p>
              </div>
            </div>
          )}

          {/* Button Section */}
          <div className="flex flex-col gap-1.5">
          <button
            className="h-12 bg-gradient-to-r cursor-pointer from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 rounded-lg text-white font-medium shadow-md transition duration-200 relative flex items-center justify-center gap-2"
            onClick={handleMessageButtonClick}
          >
            <FaCommentAlt />
            Open Messages
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-md border-2 border-gray-900">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            className="h-12 bg-gradient-to-r cursor-pointer from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg text-white font-medium shadow-md transition duration-200 flex items-center justify-center gap-2"
            onClick={handleLeaveRoom}
          >
            <FaSignOutAlt />
            Leave Room
          </button>
          </div>
        </>
      ) : (
        <>
          {/* Message View */}
          <div className="h-full flex flex-col">
            {/* Message Header */}
            <div className="p-4 border-b border-gray-700 flex items-center gap-3">
              <button
                className="text-white hover:text-amber-400 transition duration-200"
                onClick={handleBack}
                title="Go back"
              >
                <IoArrowBackCircle className="h-7 w-7" />
              </button>
              <h1 className="text-xl font-bold text-white">Messages</h1>
            </div>

            {/* Messages Display (Scrollable) */}
            <div className="flex-grow overflow-y-auto p-3 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                  <FaCommentAlt className="text-4xl text-gray-600" />
                  <p>No messages yet</p>
                  <p className="text-xs text-gray-500 text-center max-w-xs">
                    Start the conversation by sending a message below
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSystemMessage = msg.type === "system";
                  const isOwnMessage = msg.senderId === userId;

                  return (
                    <div
                      key={msg.id}
                      className={`${
                        isSystemMessage
                          ? "flex justify-center"
                          : isOwnMessage
                          ? "flex justify-end"
                          : "flex justify-start"
                      }`}
                    >
                      {isSystemMessage ? (
                        <div className="bg-gray-700 text-gray-300 text-xs py-1 px-4 rounded-full text-center max-w-xs shadow-sm">
                          {msg.text}
                        </div>
                      ) : isOwnMessage ? (
                        <div className="max-w-[85%]">
                          <div className="flex flex-col items-end">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-2 px-4 rounded-2xl rounded-br-sm shadow-md">
                              <p className="text-white break-words">{msg.text}</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-[85%]">
                          <div className="flex flex-col items-start">
                            <span className="text-xs font-medium text-amber-400 ml-1 mb-1">
                              {msg.senderName?.slice(0, 7)}
                            </span>
                            <div className="bg-gray-700 py-2 px-4 rounded-2xl rounded-bl-sm shadow-md">
                              <p className="text-white break-words">{msg.text}</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1 ml-1">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} /> {/* Auto-scroll reference */}
            </div>

            {/* Input Section */}
            <div className="p-3 border-t border-gray-700">
              <div className="flex items-end gap-2 bg-gray-800 rounded-2xl p-2">
                <textarea
                  ref={inputRef}
                  className="w-full bg-gray-700 text-white p-3 rounded-xl outline-none text-sm resize-none max-h-32 min-h-12 shadow-inner border border-gray-600 focus:border-amber-500 transition duration-200"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  className={`h-10 px-4 rounded-xl font-medium flex items-center justify-center shadow-md transition duration-200 ${
                    inputMessage.trim()
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}