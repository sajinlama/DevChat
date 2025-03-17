import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BorderBeam } from "@/components/magicui/border-beam";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/contextApi/Context";
import { FaCode } from "react-icons/fa";

export function LoginCard() {
  const [name, setName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const socket = useSocket();
  const navigate = useNavigate();

  // Function to generate a random 10-character room ID
  const createRoomId = (): string => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()";
    let newRoomId = "";

    for (let i = 0; i < 10; i++) {
      let randomIndex = Math.floor(Math.random() * characters.length);
      newRoomId += characters[randomIndex];
    }

    return newRoomId;
  };

  // Handle Create Room button click
  const handleCreateRoom = () => {
    setRoomId(createRoomId());
  };

  // Handle Join Chat button click
  const handleJoinChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !roomId) {
      alert("Please fill in both name and room ID!");
      return;
    }

    if (socket) {
      // Emit event to join the room
      socket.emit("joinroom", { name, roomId });

      console.log(`Joined room: ${roomId} as ${name}`);

      // Navigate to the room
      navigate(`/room/${roomId}`, { state: { roomId } });

      // Reset fields after joining
      setName("");
      setRoomId("");
    }
  };

  return (
    <Card className="relative w-[350px] overflow-hidden bg-black ">
      <CardHeader>
        <CardTitle>
           <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center">
                        <FaCode className="text-2xl text-blue-500 mr-2" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
                          DevChat
                        </h1>
                      </div>
                      <div className="hidden md:block ml-6">
                       
                      </div>
                    </div>
        </CardTitle>
        <CardDescription><span className="text-white"> <div className="text-sm text-gray-400">
                          Collaborative coding environment
                        </div></span></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5 text-white">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5 text-white">
            <Label htmlFor="roomId">Room ID</Label>
            <Input
              id="roomId"
              type="text"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button className="cursor-pointer" variant="outline" onClick={handleCreateRoom}>
          Create Room
        </Button>
        <Button className="cursor-pointer text-white" onClick={handleJoinChat}>
          Join Chat
        </Button>
      </CardFooter>
      <BorderBeam duration={8} size={100} />
    </Card>
  );
}
