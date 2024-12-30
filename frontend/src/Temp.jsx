import { useState } from "react";

const Demo = () => {
  const [color1, setColor1] = useState("#ff7eb3");
  const [color2, setColor2] = useState("#65d6ce");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-md rounded-xl bg-white/10 p-6 text-white shadow-lg backdrop-blur-md">
        <h1 className="mb-4 text-center text-2xl font-bold">
          Gradient Generator 🎨
        </h1>

        <div
          className="mb-4 h-32 w-full rounded-lg"
          style={{
            background: `linear-gradient(to right, ${color1}, ${color2})`,
          }}
        ></div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-col items-center">
            <label className="mb-1 text-sm text-gray-300">Color 1</label>
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="h-12 w-12 cursor-pointer appearance-none rounded-full border-none"
              style={{ background: color1, borderRadius: "50%", padding: "0" }}
            />
          </div>
          <div className="flex flex-col items-center">
            <label className="mb-1 text-sm text-gray-300">Color 2</label>
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="h-12 w-12 cursor-pointer appearance-none rounded-full border-none"
              style={{ background: color2, borderRadius: "50%", padding: "0" }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-3 text-center text-sm">
          <p>CSS Gradient Code:</p>
          <code className="text-blue-400">
            background: linear-gradient(to right, {color1}, {color2});
          </code>
        </div>
      </div>
    </div>
  );
};

export default Demo;
