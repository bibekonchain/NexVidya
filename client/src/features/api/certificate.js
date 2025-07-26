export const generateCertificate = async (courseId) => {
  const res = await fetch("/api/v1/certificate/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ courseId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to generate certificate");
  }

  return data.url;
};
