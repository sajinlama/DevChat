# DevChat Collaborative Code Editor

**DevChat** is a real-time collaborative code editor that allows multiple users to write, edit, and execute code together in a shared environment. It supports multiple programming languages, real-time code execution, and chat functionality for seamless collaboration.

---

## Features

- **Real-Time Code Collaboration**:
  - Multiple users can edit code simultaneously in a shared workspace.
  - Changes are synchronized in real-time using WebSockets.

- **Code Execution**:
  - Execute code in multiple programming languages (e.g., JavaScript, Python, Java, etc.).
  - Output is displayed in real-time for all users.

- **Host Mode**:
  - Only the host can execute code, ensuring controlled collaboration.
  - Non-host users can view and edit code but cannot execute it.

- **Integrated Chat**:
  - Real-time chat functionality for team communication.
  - System messages for user join/leave notifications.

- **Language Support**:
  - Supports multiple programming languages with syntax highlighting.

- **User Management**:
  - Displays a list of connected users in the room.
  - Highlights the host user.

- **Room Management**:
  - Unique room IDs for creating and joining sessions.
  - Copy room ID to share with collaborators.

---

## Technologies Used

- **Frontend**:
  - React.js
  - Monaco Editor (for code editing)
  - Tailwind CSS (for styling)
  - Socket.IO (for real-time communication)

- **Backend**:
  - Node.js
  - Express.js
  - Socket.IO (for WebSocket communication)
  - Code Execution API Piston

- **Other Tools**:
  - React Router (for routing)
  - React Icons (for icons)

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A code execution API (e.g., Judge0, Piston, or custom backend)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/devchat-collaborative-editor.git
   cd devchat-collaborative-editor
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add the following variables:
   ```env
   REACT_APP_SOCKET_SERVER_URL=http://localhost:5000
   REACT_APP_CODE_EXECUTION_API_URL=https://your-code-execution-api.com
   ```

4. **Start the Development Server**:
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Start the Backend Server**:
   Navigate to the backend directory and start the server:
   ```bash
   cd server
   npm install
   npm start
   ```

6. **Open the Application**:
   Visit `http://localhost:3000` in your browser.

---

## Usage

1. **Create or Join a Room**:
   - Enter a unique room ID to create a new room or join an existing one.
   - Share the room ID with collaborators.

2. **Edit Code**:
   - Write or edit code in the shared editor.
   - Changes are synchronized in real-time.

3. **Execute Code**:
   - The host can execute the code using the "Run Code" button.
   - Output is displayed in the output console.

4. **Chat with Collaborators**:
   - Use the chat sidebar to communicate with other users in the room.

5. **Leave the Room**:
   - Click the "Leave Room" button to exit the session.

---

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor.
- [Socket.IO](https://socket.io/) for real-time communication.
- [Tailwind CSS](https://tailwindcss.com/) for styling.

---



---

Enjoy coding collaboratively with **DevChat**! 🚀
