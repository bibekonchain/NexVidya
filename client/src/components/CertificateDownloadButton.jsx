import { useState } from "react";
import { generateCertificate } from "@/features/api/certificate";

const CertificateDownloadButton = ({ courseId }) => {
  const [loading, setLoading] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setError("");

    try {
      const url = await generateCertificate(courseId);
      setCertificateUrl(url);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="mt-4 text-center">
      {certificateUrl ? (
        <a
          href={certificateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          📄 Download Certificate
        </a>
      ) : (
        <button
          onClick={handleDownload}
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {loading ? "Generating..." : "Generate Certificate"}
        </button>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default CertificateDownloadButton;
