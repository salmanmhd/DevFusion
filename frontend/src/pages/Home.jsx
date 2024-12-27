import { useState } from "react";
import { useUser } from "../context/user.context";
import axios from "../config/axios";

function Home() {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/project", {
        name: projectName,
      });
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 p-4 text-white">
      <div className="projects">
        <button
          className="project rounded-md border border-slate-300 bg-gray-800 p-4 hover:bg-gray-700"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="ri-link-m text-white"></i>
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsModalOpen(false)} // Close modal when clicking the backdrop
        >
          <div
            className="w-1/3 rounded-md bg-gray-800 p-6 text-gray-100 shadow-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <h2 className="mb-4 text-xl font-semibold">Create New Project</h2>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400">
                  Project Name
                </label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
