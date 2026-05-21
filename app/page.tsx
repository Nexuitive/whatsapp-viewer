"use client";

import { useState } from "react";
import JSZip from "jszip";

import {
  Search,
  Paperclip,
  MoreVertical,
  ImageIcon,
  FileText,
  Mic,
} from "lucide-react";

export default function Home() {

  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [mediaFiles, setMediaFiles] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");
const [showMediaPanel, setShowMediaPanel] =
  useState(false);
  // ZIP Upload
  const handleZipUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    try {

      const file = event.target.files?.[0];

      if (!file) return;

      setLoading(true);
setProgress(5);
setLoadingText("Reading ZIP file...");

      const zip = await JSZip.loadAsync(file);

      setProgress(15);
setLoadingText("Extracting files...");

      let chatFile: any = null;

      const mediaUrls: any = {};

      // READ ZIP FILES
      // READ ZIP FILES
zip.forEach((relativePath, zipEntry) => {

  // TXT FILE
  if (relativePath.endsWith(".txt")) {
    chatFile = zipEntry;
  }

  // STORE MEDIA FILES
  if (
    relativePath.match(
      /\.(jpg|jpeg|png|gif|mp4|mp3|opus|pdf)$/i
    )
  ) {

    const fileName =
      relativePath
        .split("/")
        .pop()
        ?.trim();

    if (fileName) {

      mediaUrls[fileName] = zipEntry;

    }

  }

});

      if (!chatFile) {

        alert("No WhatsApp TXT File Found");

        return;
      }

      // READ CHAT TXT
      const text = await chatFile.async("string");

      const lines = text.split("\n");
setProgress(70);
setLoadingText("Parsing chat messages...");
      const parsedMessages: any[] = [];

      const totalLines = lines.length;

for (let i = 0; i < lines.length; i++) {

  let line = lines[i];

  // REAL PROGRESS
  if (i % 500 === 0) {

    const percent =
      Math.floor((i / totalLines) * 100);

    setProgress(percent);

    setLoadingText(
      `Loading messages... ${i}/${totalLines}`
    );

  }

        // Remove hidden chars
        line = line.replace(/\u200e/g, "").trim();

        const regex =
          /\[(.*?)\]\s(.*?):\s([\s\S]*)/;

        const match = line.match(regex);

        if (match) {

          parsedMessages.push({

            fullDate: match[1],

            sender: match[2],

            text: match[3],

            time: match[1].split(",")[1],

          });

        }

      }
setProgress(95);
setLoadingText("Rendering chat...");
      setMessages(parsedMessages.slice(0, 5000));

      setMediaFiles(mediaUrls);
setProgress(100);
setLoadingText("Completed!");

setTimeout(() => {

  setLoading(false);

  setProgress(0);

}, 500);
      

    } catch (error) {

      console.error(error);

      alert("Error Reading ZIP");

    }

  };

  // SEARCH
  const imageMessages =
  messages.filter((msg: any) =>
    msg.text.match(/\.(jpg|jpeg|png|gif)$/i)
  );

const videoMessages =
  messages.filter((msg: any) =>
    msg.text.match(/\.(mp4)$/i)
  );

const audioMessages =
  messages.filter((msg: any) =>
    msg.text.match(/\.(opus|mp3|wav)$/i)
  );
  const filteredMessages = messages.filter((msg: any) => {

    if (!msg?.text) return false;

    return msg.text
      .toLowerCase()
      .includes(search.toLowerCase());

  });

  return (

    <main className="h-screen bg-[#111b21] flex overflow-hidden">

      {/* SIDEBAR */}
      <div className="hidden md:flex md:w-[32%] bg-[#111b21] border-r border-[#222e35] flex flex-col">

        {/* HEADER */}
        <div className="p-4 bg-[#202c33] flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold">
              W
            </div>

            <div>

              <h1 className="text-white font-semibold">
                WhatsApp Viewer
              </h1>

              <p className="text-xs text-gray-400">
                Exported Chats
              </p>

            </div>

          </div>

          <MoreVertical className="text-gray-400" />

        </div>

        {/* UPLOAD */}
        <div className="p-4 border-b border-[#222e35]">

          <label className="bg-[#00a884] hover:bg-[#01926f] transition text-white p-3 rounded-xl cursor-pointer block text-center font-medium">

            Upload WhatsApp ZIP

            <input
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleZipUpload}
            />

          </label>

        </div>

        {/* SEARCH */}
        <div className="p-3">

          <div className="bg-[#202c33] rounded-xl flex items-center px-3">

            <Search size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-white p-3 w-full"
            />

          </div>

        </div>

      </div>
{/* MOBILE UPLOAD */}
<div className="md:hidden p-3 bg-[#202c33] border-b border-[#2f3b43]">

  <label className="bg-[#00a884] text-white p-3 rounded-xl cursor-pointer block text-center font-medium">

    Upload WhatsApp ZIP

    <input
      type="file"
      accept=".zip"
      className="hidden"
      onChange={handleZipUpload}
    />

  </label>

</div>
      {/* CHAT AREA */}
      <div className="w-full md:flex-1 flex flex-col bg-[#0b141a]">

        {/* TOP */}
        <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-[#2f3b43]">

          <div
  className="cursor-pointer"
  onClick={() =>
    setShowMediaPanel(true)
  }
>

            <h2 className="text-white font-medium">
              Chat Viewer
            </h2>

            <p className="text-xs text-gray-400">
              {filteredMessages.length} messages
            </p>

          </div>

          <div className="flex gap-4 text-gray-300">

            <Search size={20} />
            <Paperclip size={20} />
            <MoreVertical size={20} />

          </div>

        </div>

        {/* LOADING OVERLAY */}
{loading && (

  <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">

    <div className="w-[90%] md:w-[400px] bg-[#202c33] p-6 rounded-2xl">

      <h2 className="text-white text-xl font-semibold mb-4">
        Loading Chat...
      </h2>

      <div className="w-full bg-[#2a3942] rounded-full h-4 overflow-hidden">

        <div
          className="bg-[#00a884] h-full transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      <div className="flex justify-between mt-3">

        <p className="text-gray-300 text-sm">
          {loadingText}
        </p>

        <p className="text-green-400 font-semibold">
          {progress}%
        </p>

      </div>

    </div>

  </div>

)}
{/* MEDIA PANEL */}
{showMediaPanel && (

  <div className="absolute inset-0 z-50 bg-[#111b21] overflow-y-auto">

    {/* TOP */}
    <div className="bg-[#202c33] p-4 flex items-center justify-between sticky top-0">

      <h2 className="text-white text-xl font-semibold">
        Media Library
      </h2>

      <button
        onClick={() =>
          setShowMediaPanel(false)
        }
        className="text-white text-2xl"
      >
        ✕
      </button>

    </div>

    <div className="p-4 space-y-8">

      {/* IMAGES */}
      <div>

        <h3 className="text-green-400 text-lg mb-4">
          Images ({imageMessages.length})
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {imageMessages.slice(0, 100).map(
            (msg: any, index: number) => {

              const attachment =
                msg.text
                  .replace("<attached:", "")
                  .replace(">", "")
                  .trim();

              return (

                <button
                  key={index}
                  onClick={async () => {

                    const file =
                      mediaFiles[attachment];

                    if (!file) return;

                    const blob =
                      await file.async("blob");

                    const url =
                      URL.createObjectURL(blob);

                    window.open(url);

                  }}
                  className="bg-[#202c33] rounded-xl p-4 text-left text-white hover:bg-[#2a3942]"
                >

                  🖼 {attachment}

                </button>

              );

            }
          )}

        </div>

      </div>

      {/* VIDEOS */}
      <div>

        <h3 className="text-green-400 text-lg mb-4">
          Videos ({videoMessages.length})
        </h3>

        <div className="space-y-2">

          {videoMessages.slice(0, 50).map(
            (msg: any, index: number) => {

              const attachment =
                msg.text
                  .replace("<attached:", "")
                  .replace(">", "")
                  .trim();

              return (

                <div
                  key={index}
                  className="bg-[#202c33] p-4 rounded-xl text-white"
                >

                  🎥 {attachment}

                </div>

              );

            }
          )}

        </div>

      </div>

      {/* AUDIOS */}
      <div>

        <h3 className="text-green-400 text-lg mb-4">
          Voice Messages ({audioMessages.length})
        </h3>

        <div className="space-y-2">

          {audioMessages.slice(0, 50).map(
            (msg: any, index: number) => {

              const attachment =
                msg.text
                  .replace("<attached:", "")
                  .replace(">", "")
                  .trim();

              return (

                <div
                  key={index}
                  className="bg-[#202c33] p-4 rounded-xl text-white"
                >

                  🎤 {attachment}

                </div>

              );

            }
          )}

        </div>

      </div>

    </div>

  </div>

)}
        {/* MESSAGES */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-3"
          style={{
            backgroundColor: "#0b141a",
          }}
        >

          {filteredMessages.length === 0 && (

            <div className="text-gray-400">
              Upload WhatsApp ZIP File
            </div>

          )}

          {filteredMessages.map((message, index) => {

            const attachmentName =
              message.text
                .replace("<attached:", "")
                .replace(">", "")
                .trim();

            return (

              <div
                key={index}
                className={`flex ${
                  index % 2 === 0
                    ? "justify-start"
                    : "justify-end"
                }`}
              >

                <div
                  className={`relative px-4 py-2 rounded-xl text-white max-w-[85%] md:max-w-[420px] shadow ${
                    index % 2 === 0
                      ? "bg-[#202c33]"
                      : "bg-[#005c4b]"
                  }`}
                >

                  <div className="text-xs text-green-300 mb-1">
                    {message.sender}
                  </div>

                  {/* IMAGE */}
                  {message.text.includes("<attached:") ? (

                    <div className="space-y-2">

                      {attachmentName.match(/\.(jpg|jpeg|png|gif)$/i) ? (

  <button
    onClick={async () => {

      const file =
        mediaFiles[attachmentName];

      if (!file) return;

      const blob =
        await file.async("blob");

      const url =
        URL.createObjectURL(blob);

      window.open(url);

    }}
    className="bg-black/20 rounded-xl p-4 text-left w-full"
  >

    🖼 Open Image

    <div className="text-xs opacity-70 mt-2">
      {attachmentName}
    </div>

  </button>

) :

attachmentName.match(/\.(opus|mp3|wav)$/i) ? (

  <button
    onClick={async () => {

      const file =
        mediaFiles[attachmentName];

      if (!file) return;

      const blob =
        await file.async("blob");

      const url =
        URL.createObjectURL(blob);

      const audio =
        new Audio(url);

      audio.play();

    }}
    className="bg-black/20 rounded-xl p-4 text-left w-full"
  >

    🎤 Play Voice Message

    <div className="text-xs opacity-70 mt-2">
      {attachmentName}
    </div>

  </button>

) :

attachmentName.match(/\.(mp4)$/i) ? (

  <button
    onClick={async () => {

      const file =
        mediaFiles[attachmentName];

      if (!file) return;

      const blob =
        await file.async("blob");

      const url =
        URL.createObjectURL(blob);

      window.open(url);

    }}
    className="bg-black/20 rounded-xl p-4 text-left w-full"
  >

    🎥 Open Video

    <div className="text-xs opacity-70 mt-2">
      {attachmentName}
    </div>

  </button>

) : (

  <div className="bg-black/20 rounded-xl p-4">

    📎 Attachment

    <div className="text-xs opacity-70 mt-2">
      {attachmentName}
    </div>

  </div>

)}

                      <div className="text-xs opacity-70">
                        {attachmentName}
                      </div>

                    </div>

                  ) :

                  /* NORMAL TEXT */
                  (

                    <p className="break-words whitespace-pre-wrap pr-16">
                      {message.text}
                    </p>

                  )}

                  <span className="absolute bottom-1 right-2 text-[10px] text-gray-300">
                    {message.time}
                  </span>

                </div>

              </div>

            );

          })}

        </div>

        {/* BOTTOM */}
        <div className="bg-[#202c33] p-4 flex items-center gap-4 border-t border-[#2f3b43]">

          <div className="flex gap-3 text-gray-300">

            <ImageIcon />
            <FileText />
            <Mic />

          </div>

          <div className="flex-1 bg-[#2a3942] rounded-xl px-4 py-3 text-gray-400">

            Type a message

          </div>

        </div>

      </div>

    </main>

  );
}