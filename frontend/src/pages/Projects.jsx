import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import { useUser } from "../context/User.context";

const Projects = () => {
  const location = useLocation();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const { user } = useUser();
  const messageBox = React.createRef();

  const [users, setUsers] = useState([]);

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });
  };

  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const send = () => {
    sendMessage("project-message", {
      message,
      sender: user,
    });

    appendOutgoingMessage(message);

    setMessage("");
  };

  useEffect(() => {
    initializeSocket(project._id);

    receiveMessage("project-message", (data) => {
      console.log(data);
      appendIncomingMessage(data);
    });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        console.log(res.data.project);

        setProject(res.data.project);
      });

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [location.state.project._id, project._id]);

  function appendIncomingMessage(messageObject) {
    const messageBox = document.querySelector(".message-box");

    const message = document.createElement("div");
    message.classList.add(
      "message",
      "max-w-56",
      "flex",
      "flex-col",
      "p-2",
      "bg-slate-50",
      "w-fit",
      "rounded-md",
    );
    message.innerHTML = `
                <small class='opacity-65 text-xs'>${messageObject.sender.email}</small>
                <p class='text-sm'>${messageObject.message}</p>
            `;
    messageBox.appendChild(message);
    // scrollToBottom();
  }

  function appendOutgoingMessage(message) {
    const messageBox = document.querySelector(".message-box");

    const newMessage = document.createElement("div");
    newMessage.classList.add(
      "ml-auto",
      "max-w-56",
      "message",
      "flex",
      "flex-col",
      "p-2",
      "bg-slate-50",
      "w-fit",
      "rounded-md",
    );
    newMessage.innerHTML = `
                    <small class='opacity-65 text-xs'>${user.email}</small>
                    <p class='text-sm'>${message}</p>
                `;
    messageBox.appendChild(newMessage);
    // scrollToBottom();
  }

  // function scrollToBottom() {
  //   messageBox.current.scrollTop = messageBox.current.scrollHeight;
  // }

  return (
    <main className="flex h-screen w-screen">
      <section className="left relative flex h-screen min-w-96 flex-col bg-slate-300">
        <header className="absolute top-0 flex w-full items-center justify-between bg-slate-100 p-2 px-4">
          <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborator</p>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2"
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>
        <div className="conversation-area relative flex h-full flex-grow flex-col pb-10 pt-14">
          <div
            ref={messageBox}
            className="message-box scrollbar-hide flex max-h-full flex-grow flex-col gap-1 overflow-auto p-1"
          ></div>

          <div className="inputField absolute bottom-0 flex w-full">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow border-none p-2 px-4 outline-none"
              type="text"
              placeholder="Enter message"
            />
            <button onClick={send} className="bg-slate-950 px-5 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
        <div
          className={`sidePanel absolute flex h-full w-full flex-col gap-2 bg-slate-50 transition-all ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"} top-0`}
        >
          <header className="flex items-center justify-between bg-slate-200 p-2 px-4">
            <h1 className="text-lg font-semibold">Collaborators</h1>

            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2"
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2">
            {project.users &&
              project.users.map((user, i) => {
                return (
                  <div
                    key={i}
                    className="user flex cursor-pointer items-center gap-2 p-2 hover:bg-slate-200"
                  >
                    <div className="flex aspect-square h-fit w-fit items-center justify-center rounded-full bg-slate-600 p-5 text-white">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <h1 className="text-lg font-semibold">{user.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-96 max-w-full rounded-md bg-white p-4">
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list mb-16 flex max-h-96 flex-col gap-2 overflow-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`user cursor-pointer hover:bg-slate-200 ${Array.from(selectedUserId).indexOf(user._id) != -1 ? "bg-slate-200" : ""} flex items-center gap-2 p-2`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="relative flex aspect-square h-fit w-fit items-center justify-center rounded-full bg-slate-600 p-5 text-white">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="text-lg font-semibold">{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded-md bg-blue-600 px-4 py-2 text-white"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Projects;
