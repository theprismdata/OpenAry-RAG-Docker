// src/components/dashboard/FileDashboard.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "../../utils/axios_chatapi";

export default function FileDashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columnWidths, setColumnWidths] = useState({
    fileName: 400, // 초기 너비
    summary: 600, // 초기 너비
  });
  const [resizing, setResizing] = useState(null);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.post(
        "/getdocs",
        {
          email: user.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formattedFiles = response.data.file.map((fileObj) => {
        const [fileName, summary] = Object.entries(fileObj)[0];
        return { fileName, summary };
      });

      setFiles(formattedFiles);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e, column) => {
    setResizing(column);

    const startX = e.pageX;
    const startWidth = columnWidths[column];

    const handleMouseMove = (moveEvent) => {
      if (resizing) {
        const diff = moveEvent.pageX - startX;
        setColumnWidths((prev) => ({
          ...prev,
          [column]: Math.max(100, startWidth + diff), // 최소 너비 100px
        }));
      }
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">문서 분석 요약</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{ width: columnWidths.fileName }}
              >
                File Name
                <div
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-700"
                  onMouseDown={(e) => handleMouseDown(e, "fileName")}
                />
              </th>
              <th
                className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{ width: columnWidths.summary }}
              >
                Summary
                <div
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-700"
                  onMouseDown={(e) => handleMouseDown(e, "summary")}
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {files.map((file, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td
                  className="px-6 py-4 text-sm font-medium text-gray-900 truncate"
                  style={{
                    width: columnWidths.fileName,
                    maxWidth: columnWidths.fileName,
                  }}
                >
                  {file.fileName}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-500"
                  style={{
                    width: columnWidths.summary,
                    maxWidth: columnWidths.summary,
                  }}
                >
                  {file.summary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {resizing && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-10 cursor-col-resize" />
      )}
    </div>
  );
}
