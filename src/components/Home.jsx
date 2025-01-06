import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { nanoid } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { addToPaste, updateToPaste } from "../features/paste/pasteSlice";

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const pasteId = searchParams.get("pasteId");
  const dispatch = useDispatch();

  function createPaste() {
    // create the paste to send to reducer
    const paste = {
      _id: pasteId || nanoid(),
      title: title,
      content: value,
      createdAt: new Date().toISOString(),
    };

    if (pasteId) {
      dispatch(updateToPaste(paste));
    } else {
      dispatch(addToPaste(paste));
    }
    // cleanup the fields
    setTitle("");
    setValue("");
    setSearchParams({});
  }

  return (
    <div className="flex items-center justify-center w-full font-serif bg-[#09090B] text-white">
      <div className="w-2/3 border  flex items-center justify-center flex-col mt-5">

        <div className="flex justify-between items-center border w-[100%]">
          <input
            type="text"
            placeholder="Enter the paste title"
            minLength="3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-[#0F0F0F] p-3 w-2/3 "
          />
          <button
            onClick={createPaste}
            className="bg-purple-500 text-white p-3 rounded-md"
          >
            {searchParams.get("pasteId") ? "Edit Paste" : "Create Paste"}
          </button>
        </div>

        <div className="flex justify-start items-center border w-[100%]">
          <textarea
            name="pastecontent"
            id="pastecontent"
            placeholder="Enter the paste content"
            minLength="3"
            rows="25"
            cols="200"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-[#0F0F0F] p-3 "
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
