import { FaFileLines } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { useRef, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const uploadFile = async (selectedFiles) => {
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (!file) continue;

      const fileId = uuidv4();

      const fileName =
        file.name.length > 12
          ? `${file.name.substring(0, 13)}.. .${file.name.split(".")[1]}`
          : file.name;

      setFiles((prev) => [...prev, { id: fileId, name: fileName, loading: 0 }]);
      setShowProgress(true);

      await new Promise((resolve) => {
        const formData = new FormData();
        formData.append("file", file);

        axios.post("http://localhost:3001/upload", formData, {
          onUploadProgress: (progressEvent) => {
            const totalLoaded = progressEvent.loaded;
            const totalSize = progressEvent.total;

            setFiles((prev) => {
              const newFiles = [...prev];
              newFiles[newFiles.length - 1].loading = Math.floor(
                (totalLoaded / totalSize) * 100
              );
              return newFiles;
            });

            if (totalLoaded === totalSize) {
              const fileSize =
                totalSize < 1024
                  ? `${totalSize} KB`
                  : `${(totalLoaded / (1024 * 1024)).toFixed(2)} MB`;

              setUploadedFiles((prev) => [
                ...prev,
                { id: fileId, name: fileName, size: fileSize },
              ]);

              setFiles([]);
              setShowProgress(false);
              resolve();
            }
          },
        });
      });
    }
  };

  const handleDeleteFile = (fileId, isUploadedFile) => {
    if (isUploadedFile) {
      const updatedUploadedFiles = uploadedFiles.filter(
        (file) => file.id !== fileId
      );
      setUploadedFiles(updatedUploadedFiles);
    } else {
      const updatedFiles = files.filter((file) => file.id !== fileId);
      setFiles(updatedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.add("dragover");
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.add("dragover");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.remove("dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.remove("dragover");

    const droppedFiles = e.dataTransfer.files;
    uploadFile(droppedFiles);
  };

  return (
    <div className="flex w-full h-screen items-center justify-center">
      {/* -----------Upload Container------------ */}
      <div
        ref={dropAreaRef}
        className="w-[400px] bg-white shadow-lg min-h-[300px] rounded-xl p-4 drop-area"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <h2 className="text-black font-semibold text-lg">Upload file</h2>
        <div className="bg-gray-100 h-[1px] mt-2"></div>
        {/* --------- Input file form ---------- */}
        <form className="h-[180px] mt-5 flex items-center justify-center flex-col gap-1 border-dashed border-[2px] border-gray-300 rounded-xl">
          <input
            type="file"
            name="file"
            hidden
            ref={fileInputRef}
            onChange={(e) => uploadFile(e.target.files)}
            multiple // Allow multiple file selection
          />
          <div className="flex items-center justify-center flex-col gap-3">
            <img
              className="w-[40px] h-[40px]"
              src="/icons8-image-upload-64.png"
              alt="upload file icon"
            />
          </div>
          <p className="font-medium">
            Drop your file here, or{" "}
            <span
              className="underline cursor-pointer text-[#00acea]"
              onClick={handleFileInputClick}
            >
              Browse
            </span>
          </p>
          <p className="text-gray-400 text-[14px] font-medium">
            Maximum file size 500mb
          </p>
        </form>

        {/* --------While uploading files--------- */}
        {showProgress && (
          <section className="mt-2">
            {files.map((file, index) => (
              <li key={index}>
                <div className=" flex items-center justify-between p-2 border-b w-full">
                  <div className="flex items-center gap-2 flex-[3] w-full">
                    <FaFileLines className="text-red-400 text-[32px]" />
                    <div className="flex flex-col gap-0">
                      <p className="text-gray-500 font-medium text-[14px]">
                        {file?.name}
                      </p>
                      <p className="text-gray-400 font-medium text-[11px]">
                        {file?.size}
                      </p>
                    </div>
                  </div>

                  <div className="percentage flex-[2] w-full flex bg-gray-00 items-center justify-center gap-1">
                    <div className="loading-bar h-[4px] bg-gray-200 rounded-lg w-full overflow-hidden">
                      <div
                        style={{ width: `${file?.loading}%` }}
                        className={`loading bg-[#00acea] h-full`}
                      ></div>
                    </div>
                    <p className="text-gray-400 font-medium text-[11px] min-w-[35px]">
                      {file?.loading}%
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </section>
        )}

        {/* ---------uploaded files--------- */}
        <section className="mt-2">
          {uploadedFiles.map((file, index) => (
            <li key={index}>
              <div className=" flex items-center justify-between p-2 border-b w-full">
                <div className="flex items-center gap-2 flex-[3] w-full overflow-hidden">
                  <FaFileLines className="text-red-500 text-[32px]" />
                  <div className="flex flex-col gap-0">
                    <p className="text-gray-950 font-medium text-[14px]">
                      {file?.name}
                    </p>
                    <p className="text-gray-400 font-medium text-[11px]">
                      {file?.size}
                    </p>
                  </div>
                </div>

                <div className="percentage flex-1 w-full flex bg-gray-00 items-center justify-center gap-1">
                  <div className="loading-bar h-[4px] bg-white rounded-lg w-full overflow-hidden">
                    <div className="loading w-[10%] h-full"></div>
                  </div>
                  <p
                    onClick={() => {
                      handleDeleteFile(file.id, true);
                    }}
                    className="text-red-500 font-medium text-[12px] min-w-[30px] cursor-pointer"
                  >
                    <RxCross2 />
                  </p>
                </div>
              </div>
            </li>
          ))}
        </section>
      </div>
    </div>
  );
};

export default App;
