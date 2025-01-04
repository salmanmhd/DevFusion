import { useState, useEffect, useRef, createRef } from "react";
import { useUser } from "../context/user.context";
import { useLocation } from "react-router-dom";
import Markdown from "markdown-to-jsx";
import axios from "../config/axios";
import hljs from "highlight.js";
import { getWebContainer } from "../config/webcontainer";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);

      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Projects = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set()); // Initialized as Set
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const { user } = useUser();
  const messageBox = createRef();
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = initializeSocket(project._id);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("container started");
      });
    }

    receiveMessage("project-message", (data) => {
      console.log(data);

      if (data.sender._id === "ai") {
        try {
          const message = JSON.parse(data.message);

          console.log(message);

          if (message.fileTree && typeof message.fileTree === "object") {
            webContainer?.mount(message.fileTree);
            setFileTree(message.fileTree || {});
          }
        } catch (error) {
          console.error("Failed to parse message or mount fileTree:", error);
        }
      }

      setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
      scrollToBottom();
    });

    axios
      .get(`/projects/get-projects/${location.state.project._id}`)
      .then((res) => {
        console.log(res.data.project);

        setProject(res.data.project);
        setFileTree(res.data.project.fileTree || {});
      });

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [location.state.project._id, project._id, webContainer]);

  async function handleRun() {
    await webContainer.mount(fileTree);
    console.log("fileTree mounted", fileTree);

    const installProcess = await webContainer.spawn("npm", ["install"]);

    installProcess.output.pipeTo(
      new WritableStream({
        write(chunk) {
          console.log(chunk);
        },
      }),
    );

    if (runProcess) {
      runProcess.kill();
    }

    setTimeout(async () => {
      let tempRunProcess = await webContainer.spawn("npm", ["start"]);

      tempRunProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(chunk);
          },
        }),
      );

      setRunProcess(tempRunProcess);

      webContainer.on("server-ready", (port, url) => {
        console.log(port, url);
        setIframeUrl(url);
      });
    }, 3000);
  }
  function handleUserClick(id) {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });
  }

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

  function send() {
    sendMessage("project-message", {
      message,
      sender: user,
    });
    setMessages((prevMessages) => [...prevMessages, { sender: user, message }]); // Update messages state
    setMessage("");
    scrollToBottom();
  }

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message);

    return (
      <div className="overflow-auto rounded-sm bg-slate-950 p-2 text-white">
        <Markdown
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        >
          {messageObject.text}
        </Markdown>
      </div>
    );
  }

  function saveFileTree(ft) {
    axios
      .put("/projects/update-file-tree", {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function scrollToBottom() {
    const messageBox = document.querySelector(".message-box");

    if (!messageBox) {
      console.error("Message box element not found in scrollToBottom");
      return;
    }

    messageBox.scrollTop = messageBox.scrollHeight;
  }

  return (
    <main className="flex h-screen w-screen bg-gray-900 text-gray-200">
      <section className="left relative flex h-screen min-w-96 flex-col bg-gray-800">
        <header className="absolute top-0 z-10 flex w-full items-center justify-between bg-gray-700 p-3 px-5 shadow-md">
          <button
            className="flex items-center gap-2 text-gray-200 hover:text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-user-add-line text-lg"></i>
            <p>Add Collaborator</p>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 hover:text-white"
          >
            <i className="ri-group-line text-lg"></i>
          </button>
        </header>
        <div className="conversation-area relative flex h-full flex-grow flex-col pb-12 pt-16">
          <div
            ref={messageBox}
            className="message-box scrollbar-hide flex max-h-full flex-grow flex-col gap-2 overflow-auto p-3"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.sender._id === "ai"
                    ? "max-w-80 bg-gray-700"
                    : "max-w-52 bg-blue-600"
                } ${msg.sender._id === user._id.toString() && "ml-auto"} message flex w-fit flex-col rounded-lg p-3 shadow-lg`}
              >
                <small className="text-xs text-gray-400">
                  {msg.sender.email}
                </small>
                <div className="text-sm">
                  {msg.sender._id === "ai" ? (
                    WriteAiMessage(msg.message)
                  ) : (
                    <p>{msg.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="inputField absolute bottom-0 flex w-full bg-gray-700 p-2">
            <input
              value={message}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  send();
                }
              }}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow rounded-md border-none bg-gray-800 p-3 px-5 text-gray-200 outline-none"
              type="text"
              placeholder="Enter message..."
            />
            <button
              onClick={send}
              className="rounded-md bg-blue-600 px-5 text-white hover:bg-blue-500"
            >
              <i className="ri-send-plane-2-fill text-lg"></i>
            </button>
          </div>
        </div>
        <div
          className={`sidePanel absolute flex h-full w-full flex-col gap-3 bg-gray-800 p-3 shadow-md transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          <header className="flex items-center justify-between bg-gray-700 p-3 px-5">
            <h1 className="text-lg font-semibold">Collaborators</h1>

            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2 hover:text-white"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-3">
            {project.users &&
              project.users.map((user, i) => {
                return (
                  <div
                    key={i}
                    className="user flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-700"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                      <i className="ri-user-line text-lg text-white"></i>
                    </div>
                    <h1 className="text-lg font-semibold">{user.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="right flex h-full flex-grow bg-gray-800">
        <div className="explorer h-full min-w-52 max-w-64 bg-gray-700">
          <div className="file-tree w-full">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFile((prev) => (prev === file ? null : file));
                  setOpenFiles([...new Set([...openFiles, file])]);
                }}
                className="tree-element flex w-full cursor-pointer items-center gap-3 p-3 px-5 text-gray-200 hover:bg-gray-600"
              >
                <p className="text-lg font-semibold">{file}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="code-editor flex h-full flex-grow flex-col">
          {currentFile && (
            <div className="actions flex gap-3 p-3">
              <button
                onClick={handleRun}
                className="rounded-lg bg-blue-600 p-3 px-5 text-white hover:bg-blue-500"
              >
                Run
              </button>
            </div>
          )}

          <div className="bottom flex max-w-full flex-grow overflow-auto">
            {fileTree[currentFile] && (
              <div className="code-editor-area h-full flex-grow overflow-auto bg-gray-900 p-5">
                <pre className="hljs h-full">
                  <code
                    className="hljs h-full outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText;
                      const ft = {
                        ...fileTree,
                        [currentFile]: {
                          file: {
                            contents: updatedContent,
                          },
                        },
                      };
                      setFileTree(ft);
                      saveFileTree(ft);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(
                        "javascript",
                        fileTree[currentFile].file.contents,
                      ).value,
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingBottom: "25rem",
                      counterSet: "line-numbering",
                    }}
                  />
                </pre>
              </div>
            )}
          </div>
        </div>

        {iframeUrl && webContainer && (
          <div className="flex h-full min-w-96 flex-col">
            <div className="address-bar bg-gray-700 p-3">
              <input
                type="text"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setIframeUrl("/");
                  } else {
                    setIframeUrl(`/${value}`);
                  }
                }}
                value={iframeUrl === "/" ? "" : iframeUrl.slice(1)}
                className="w-full rounded-md bg-gray-800 p-3 px-5 text-gray-200"
              />
            </div>

            <iframe src={iframeUrl} className="h-full w-full bg-gray-900" />
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative w-96 max-w-full rounded-lg bg-gray-800 p-5 shadow-lg">
            <header className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:text-white"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </header>
            <div className="users-list mb-5 flex max-h-96 flex-col gap-3 overflow-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`user flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-700 ${
                    Array.from(selectedUserId).indexOf(user._id) !== -1 &&
                    "bg-gray-700"
                  }`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                    <i className="ri-user-line text-white"></i>
                  </div>
                  <h1 className="text-lg font-semibold">{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="w-full rounded-md bg-blue-600 p-3 text-white hover:bg-blue-500"
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
