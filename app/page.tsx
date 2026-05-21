"use client";

import { useEffect, useState } from "react";
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
const [showMediaPanel, setShowMediaPanel] = useState(false);

const [fullscreenImage, setFullscreenImage] = useState("");

const [visibleCount, setVisibleCount] = useState(5000);

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

      zip.forEach((relativePath, zipEntry) => {

        if (relativePath.endsWith(".txt")) {
          chatFile = zipEntry;
        }

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

      const text = await chatFile.async("string");

      const lines = text.split("\n");

      setProgress(70);
      setLoadingText("Parsing chat messages...");

      const parsedMessages: any[] = [];

      const totalLines = lines.length;

      for (let i = 0; i < lines.length; i++) {

        let line = lines[i];

        if (i % 500 === 0) {

          const percent =
            Math.floor((i / totalLines) * 100);

          setProgress(percent);

          setLoadingText(
            `Loading messages... ${i}/${totalLines}`
          );

        }

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

      setMessages(parsedMessages);

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

  // SEARCH FILTER
 const visibleMessages =
  messages.slice(0, visibleCount);

  // MEDIA FILTERS
  const imageMessages =
    messages.filter((msg: any) =>
      msg.text.match(
        /\.(jpg|jpeg|png|gif)$/i
      )
    );

  const videoMessages =
    messages.filter((msg: any) =>
      msg.text.includes("video omitted") ||
      msg.text.match(/\.(mp4)$/i)
    );

  const audioMessages =
    messages.filter((msg: any) =>
      msg.text.match(
        /\.(opus|mp3|wav)$/i
      )
    );

  return (

    <main className="h-screen bg-[#111b21] flex overflow-hidden">

      {/* SIDEBAR */}
      <div className="hidden md:flex md:w-[32%] lg:w-[28%] bg-[#111b21] border-r border-[#222e35] flex-col">

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

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col w-full bg-[#0b141a]">

        {/* TOP BAR */}
        <div className="bg-[#202c33] p-3 md:p-4 flex items-center justify-between border-b border-[#2f3b43]">

          <div
            className="cursor-pointer select-none"
            
            onClick={() =>
              setShowMediaPanel(true)
              
              
            }
          >

            <h2 className="text-white font-medium">
              Chat Viewer
            </h2>

            <p className="text-xs text-gray-400">
              {visibleMessages.length} / {messages.length} messages
            </p>

          </div>

          <div className="flex items-center gap-2 md:gap-4 text-gray-300">

            {/* MOBILE SEARCH */}
            <div className="md:hidden flex-1">

              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="bg-[#2a3942] text-white px-3 py-2 rounded-xl w-full outline-none"
              />

            </div>

            {/* MOBILE UPLOAD */}
            <div className="md:hidden">

              <label className="bg-[#00a884] text-white px-3 py-2 rounded-xl cursor-pointer text-sm font-medium">

                Upload

                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleZipUpload}
                />

              </label>

            </div>

            <Search size={20} />
            <Paperclip size={20} />
            <MoreVertical size={20} />

          </div>

        </div>

        {/* LOADING */}
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

        {/* FULLSCREEN IMAGE */}
        {fullscreenImage && (

          <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center">

            <button
              onClick={() =>
                setFullscreenImage("")
              }
              className="absolute top-5 right-5 text-white text-4xl z-50"
            >
              ✕
            </button>

            <img
              src={fullscreenImage}
              alt="fullscreen"
              className="max-w-full max-h-full object-contain p-4"
            />

          </div>

        )}

        {/* MESSAGES */}
        <div
          className="flex-1 overflow-y-auto p-2 md:p-6 space-y-3"
          style={{
            backgroundColor: "#0b141a",
          }}
        >

          {messages.filter.length === 0 && (

            <div className="text-gray-400">
              Upload WhatsApp ZIP File
            </div>

          )}

          {visibleMessages.map((message, index) => {

            const attachmentName =
              message.text
                .replace("<attached:", "")
                .replace(">", "")
                .trim();

            const isVideo =
  message.text.includes("video omitted") ||
  attachmentName.match(/\.(mp4|mov|3gp|mkv)$/i);

            const isImage =
              attachmentName.match(
                /\.(jpg|jpeg|png|gif)$/i
              );

            const isAudio =
              attachmentName.match(
                /\.(opus|mp3|wav)$/i
              );

            return (

              <div
                key={index}
                className={`flex ${
                  message.sender === "Eba"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >

                <div
                  className={`relative px-4 py-2 rounded-xl text-white max-w-[92%] md:max-w-[420px] shadow ${
                    message.sender === "Eba"
                      ? "bg-[#202c33]"
                      : "bg-[#005c4b]"
                  }`}
                >

                  <div className="text-xs text-green-300 mb-1">
                    {message.sender}
                  </div>

                  {message.text.includes("<attached:") ||
                  isVideo ? (

                    <div className="space-y-2">

                      {/* IMAGE */}
                      {isImage ? (

                        <ImageMessage
                          attachmentName={attachmentName}
                          mediaFiles={mediaFiles}
                          setFullscreenImage={setFullscreenImage}
                        />

                      ) : isAudio ? (

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

                      ) : isVideo ? (

  <VideoMessage
    attachmentName={attachmentName}
    mediaFiles={mediaFiles}
  />


                      ) : (

                        <div className="bg-black/20 rounded-xl p-4">

                          📎 Attachment

                          <div className="text-xs opacity-70 mt-2">
                            {attachmentName}
                          </div>

                        </div>

                      )}

                    </div>

                  ) : (

                    <p className="break-words whitespace-pre-wrap pr-16">

  {search &&
  message.text
    .toLowerCase()
    .includes(search.toLowerCase()) ? (

    <span className="bg-yellow-400 text-black px-1 rounded">

      {message.text}

    </span>

  ) : (

    message.text

  )}

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
{/* LOAD MORE */}
{visibleCount < messages.length && (

  <div className="p-4 flex justify-center">

    <button
      onClick={() =>
        setVisibleCount(
          prev => prev + 5000
        )
      }
      className="bg-[#00a884] hover:bg-[#01926f] transition text-white px-6 py-3 rounded-xl font-medium"
    >

      Load More Messages

    </button>

  </div>

)}


        {/* BOTTOM BAR */}
        <div className="bg-[#202c33] p-2 md:p-4 flex items-center gap-2 md:gap-4 border-t border-[#2f3b43]">

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

function ImageMessage({
  attachmentName,
  mediaFiles,
  setFullscreenImage,
}: any) {

  const [imageUrl, setImageUrl] =
    useState("");

  useEffect(() => {

    const loadImage = async () => {

      const file =
        mediaFiles[attachmentName];

      if (!file) return;

      const blob =
        await file.async("blob");

      const url =
        URL.createObjectURL(blob);

      setImageUrl(url);

    };

    loadImage();

  }, [attachmentName, mediaFiles]);

  return (

    <div>

      {imageUrl ? (

        <img
          src={imageUrl}
          alt="attachment"
          onClick={() =>
            setFullscreenImage(imageUrl)
          }
          className="rounded-xl max-w-[250px] cursor-pointer hover:opacity-90 transition"
        />

      ) : (

        <div className="bg-black/20 rounded-xl p-6 text-white">
          Loading image...
        </div>

      )}

      <div className="text-xs opacity-70 mt-2">
        {attachmentName}
      </div>

    </div>

  );

}

function VideoMessage({
  attachmentName,
  mediaFiles,
}: any) {

  const [videoUrl, setVideoUrl] =
    useState("");

  useEffect(() => {

    const loadVideo = async () => {

   const file =
  mediaFiles[attachmentName];

      if (!file) return;

      const blob =
        await file.async("blob");

      const url =
        URL.createObjectURL(blob);

      setVideoUrl(url);

    };

    loadVideo();

  }, [attachmentName, mediaFiles]);

  return (

    <div className="space-y-2">

      {videoUrl ? (

        <video
          controls
          className="rounded-xl max-w-[280px]"
        >

          <source
            src={videoUrl}
            type="video/mp4"
          />

        </video>

      ) : (

        <div className="bg-black/20 rounded-xl p-6 text-white">
          Loading video...
        </div>

      )}

      <div className="text-xs opacity-70">
        {attachmentName || "Video"}
      </div>

    </div>

  );

}