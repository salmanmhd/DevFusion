// import React, { useState, useEffect, useContext, useRef } from "react";
// import { UserContext } from "../context/user.context";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "../config/axios";
// import {
//   initializeSocket,
//   receiveMessage,
//   sendMessage,
// } from "../config/socket";
// import Markdown from "markdown-to-jsx";
// import hljs from "highlight.js";
// import { getWebContainer } from "../config/webcontainer";

// function SyntaxHighlightedCode(props) {
//   const ref = useRef(null);

//   React.useEffect(() => {
//     if (ref.current && props.className?.includes("lang-") && window.hljs) {
//       window.hljs.highlightElement(ref.current);

//       // hljs won't reprocess the element unless this attribute is removed
//       ref.current.removeAttribute("data-highlighted");
//     }
//   }, [props.className, props.children]);

//   return <code {...props} ref={ref} />;
// }

// const Project = () => {
//   const location = useLocation();

//   const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedUserId, setSelectedUserId] = useState(new Set()); // Initialized as Set
//   const [project, setProject] = useState(location.state.project);
//   const [message, setMessage] = useState("");
//   const { user } = useContext(UserContext);
//   const messageBox = React.createRef();

//   const [users, setUsers] = useState([]);
//   const [messages, setMessages] = useState([]); // New state variable for messages
//   const [fileTree, setFileTree] = useState({});

//   const [currentFile, setCurrentFile] = useState(null);
//   const [openFiles, setOpenFiles] = useState([]);

//   const [webContainer, setWebContainer] = useState(null);
//   const [iframeUrl, setIframeUrl] = useState(null);

//   const [runProcess, setRunProcess] = useState(null);

//   const handleUserClick = (id) => {
//     setSelectedUserId((prevSelectedUserId) => {
//       const newSelectedUserId = new Set(prevSelectedUserId);
//       if (newSelectedUserId.has(id)) {
//         newSelectedUserId.delete(id);
//       } else {
//         newSelectedUserId.add(id);
//       }

//       return newSelectedUserId;
//     });
//   };

//   function addCollaborators() {
//     axios
//       .put("/projects/add-user", {
//         projectId: location.state.project._id,
//         users: Array.from(selectedUserId),
//       })
//       .then((res) => {
//         console.log(res.data);
//         setIsModalOpen(false);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   const send = () => {
//     sendMessage("project-message", {
//       message,
//       sender: user,
//     });
//     setMessages((prevMessages) => [...prevMessages, { sender: user, message }]); // Update messages state
//     setMessage("");
//   };

//   function WriteAiMessage(message) {
//     const messageObject = JSON.parse(message);

//     return (
//       <div className="overflow-auto rounded-sm bg-slate-950 p-2 text-white">
//         <Markdown
//           children={messageObject.text}
//           options={{
//             overrides: {
//               code: SyntaxHighlightedCode,
//             },
//           }}
//         />
//       </div>
//     );
//   }

//   useEffect(() => {
//     initializeSocket(project._id);

//     if (!webContainer) {
//       getWebContainer().then((container) => {
//         setWebContainer(container);
//         console.log("container started");
//       });
//     }

//     receiveMessage("project-message", (data) => {
//       console.log(data);

//       if (data.sender._id == "ai") {
//         const message = JSON.parse(data.message);

//         console.log(message);

//         webContainer?.mount(message.fileTree);

//         if (message.fileTree) {
//           setFileTree(message.fileTree || {});
//         }
//         setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
//       } else {
//         setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
//       }
//     });

//     axios
//       .get(`/projects/get-project/${location.state.project._id}`)
//       .then((res) => {
//         console.log(res.data.project);

//         setProject(res.data.project);
//         setFileTree(res.data.project.fileTree || {});
//       });

//     axios
//       .get("/users/all")
//       .then((res) => {
//         setUsers(res.data.users);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }, []);

//   function saveFileTree(ft) {
//     axios
//       .put("/projects/update-file-tree", {
//         projectId: project._id,
//         fileTree: ft,
//       })
//       .then((res) => {
//         console.log(res.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   // Removed appendIncomingMessage and appendOutgoingMessage functions

//   function scrollToBottom() {
//     messageBox.current.scrollTop = messageBox.current.scrollHeight;
//   }

//   return (
//     <main className="flex h-screen w-screen">
//       <section className="left relative flex h-screen min-w-96 flex-col bg-slate-300">
//         <header className="absolute top-0 z-10 flex w-full items-center justify-between bg-slate-100 p-2 px-4">
//           <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
//             <i className="ri-add-fill mr-1"></i>
//             <p>Add collaborator</p>
//           </button>
//           <button
//             onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
//             className="p-2"
//           >
//             <i className="ri-group-fill"></i>
//           </button>
//         </header>
//         <div className="conversation-area relative flex h-full flex-grow flex-col pb-10 pt-14">
//           <div
//             ref={messageBox}
//             className="message-box scrollbar-hide flex max-h-full flex-grow flex-col gap-1 overflow-auto p-1"
//           >
//             {messages.map((msg, index) => (
//               <div
//                 key={index}
//                 className={`${msg.sender._id === "ai" ? "max-w-80" : "max-w-52"} ${msg.sender._id == user._id.toString() && "ml-auto"} message flex w-fit flex-col rounded-md bg-slate-50 p-2`}
//               >
//                 <small className="text-xs opacity-65">{msg.sender.email}</small>
//                 <div className="text-sm">
//                   {msg.sender._id === "ai" ? (
//                     WriteAiMessage(msg.message)
//                   ) : (
//                     <p>{msg.message}</p>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="inputField absolute bottom-0 flex w-full">
//             <input
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               className="flex-grow border-none p-2 px-4 outline-none"
//               type="text"
//               placeholder="Enter message"
//             />
//             <button onClick={send} className="bg-slate-950 px-5 text-white">
//               <i className="ri-send-plane-fill"></i>
//             </button>
//           </div>
//         </div>
//         <div
//           className={`sidePanel absolute flex h-full w-full flex-col gap-2 bg-slate-50 transition-all ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"} top-0`}
//         >
//           <header className="flex items-center justify-between bg-slate-200 p-2 px-4">
//             <h1 className="text-lg font-semibold">Collaborators</h1>

//             <button
//               onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
//               className="p-2"
//             >
//               <i className="ri-close-fill"></i>
//             </button>
//           </header>
//           <div className="users flex flex-col gap-2">
//             {project.users &&
//               project.users.map((user, i) => {
//                 return (
//                   <div
//                     key={i}
//                     className="user flex cursor-pointer items-center gap-2 p-2 hover:bg-slate-200"
//                   >
//                     <div className="flex aspect-square h-fit w-fit items-center justify-center rounded-full bg-slate-600 p-5 text-white">
//                       <i className="ri-user-fill absolute"></i>
//                     </div>
//                     <h1 className="text-lg font-semibold">{user.email}</h1>
//                   </div>
//                 );
//               })}
//           </div>
//         </div>
//       </section>

//       <section className="right flex h-full flex-grow bg-red-50">
//         <div className="explorer h-full min-w-52 max-w-64 bg-slate-200">
//           <div className="file-tree w-full">
//             {Object.keys(fileTree).map((file, index) => (
//               <button
//                 key={index}
//                 onClick={() => {
//                   setCurrentFile(file);
//                   setOpenFiles([...new Set([...openFiles, file])]);
//                 }}
//                 className="tree-element flex w-full cursor-pointer items-center gap-2 bg-slate-300 p-2 px-4"
//               >
//                 <p className="text-lg font-semibold">{file}</p>
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="code-editor flex h-full shrink flex-grow flex-col">
//           <div className="top flex w-full justify-between">
//             <div className="files flex">
//               {openFiles.map((file, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentFile(file)}
//                   className={`open-file flex w-fit cursor-pointer items-center gap-2 bg-slate-300 p-2 px-4 ${currentFile === file ? "bg-slate-400" : ""}`}
//                 >
//                   <p className="text-lg font-semibold">{file}</p>
//                 </button>
//               ))}
//             </div>

//             <div className="actions flex gap-2">
//               <button
//                 onClick={async () => {
//                   await webContainer.mount(fileTree);

//                   const installProcess = await webContainer.spawn("npm", [
//                     "install",
//                   ]);

//                   installProcess.output.pipeTo(
//                     new WritableStream({
//                       write(chunk) {
//                         console.log(chunk);
//                       },
//                     }),
//                   );

//                   if (runProcess) {
//                     runProcess.kill();
//                   }

//                   let tempRunProcess = await webContainer.spawn("npm", [
//                     "start",
//                   ]);

//                   tempRunProcess.output.pipeTo(
//                     new WritableStream({
//                       write(chunk) {
//                         console.log(chunk);
//                       },
//                     }),
//                   );

//                   setRunProcess(tempRunProcess);

//                   webContainer.on("server-ready", (port, url) => {
//                     console.log(port, url);
//                     setIframeUrl(url);
//                   });
//                 }}
//                 className="bg-slate-300 p-2 px-4 text-white"
//               >
//                 run
//               </button>
//             </div>
//           </div>
//           <div className="bottom flex max-w-full shrink flex-grow overflow-auto">
//             {fileTree[currentFile] && (
//               <div className="code-editor-area h-full flex-grow overflow-auto bg-slate-50">
//                 <pre className="hljs h-full">
//                   <code
//                     className="hljs h-full outline-none"
//                     contentEditable
//                     suppressContentEditableWarning
//                     onBlur={(e) => {
//                       const updatedContent = e.target.innerText;
//                       const ft = {
//                         ...fileTree,
//                         [currentFile]: {
//                           file: {
//                             contents: updatedContent,
//                           },
//                         },
//                       };
//                       setFileTree(ft);
//                       saveFileTree(ft);
//                     }}
//                     dangerouslySetInnerHTML={{
//                       __html: hljs.highlight(
//                         "javascript",
//                         fileTree[currentFile].file.contents,
//                       ).value,
//                     }}
//                     style={{
//                       whiteSpace: "pre-wrap",
//                       paddingBottom: "25rem",
//                       counterSet: "line-numbering",
//                     }}
//                   />
//                 </pre>
//               </div>
//             )}
//           </div>
//         </div>

//         {iframeUrl && webContainer && (
//           <div className="flex h-full min-w-96 flex-col">
//             <div className="address-bar">
//               <input
//                 type="text"
//                 onChange={(e) => setIframeUrl(e.target.value)}
//                 value={iframeUrl}
//                 className="w-full bg-slate-200 p-2 px-4"
//               />
//             </div>
//             <iframe src={iframeUrl} className="h-full w-full"></iframe>
//           </div>
//         )}
//       </section>

//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="relative w-96 max-w-full rounded-md bg-white p-4">
//             <header className="mb-4 flex items-center justify-between">
//               <h2 className="text-xl font-semibold">Select User</h2>
//               <button onClick={() => setIsModalOpen(false)} className="p-2">
//                 <i className="ri-close-fill"></i>
//               </button>
//             </header>
//             <div className="users-list mb-16 flex max-h-96 flex-col gap-2 overflow-auto">
//               {users.map((user) => (
//                 <div
//                   key={user.id}
//                   className={`user cursor-pointer hover:bg-slate-200 ${Array.from(selectedUserId).indexOf(user._id) != -1 ? "bg-slate-200" : ""} flex items-center gap-2 p-2`}
//                   onClick={() => handleUserClick(user._id)}
//                 >
//                   <div className="relative flex aspect-square h-fit w-fit items-center justify-center rounded-full bg-slate-600 p-5 text-white">
//                     <i className="ri-user-fill absolute"></i>
//                   </div>
//                   <h1 className="text-lg font-semibold">{user.email}</h1>
//                 </div>
//               ))}
//             </div>
//             <button
//               onClick={addCollaborators}
//               className="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded-md bg-blue-600 px-4 py-2 text-white"
//             >
//               Add Collaborators
//             </button>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// };

// export default Project;
