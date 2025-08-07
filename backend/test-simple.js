// Test simple HTTP request menggunakan built-in Node.js modules
import http from "http";

const testData = JSON.stringify({
  tanggal: "2025-08-31",
  waktu: "17:06",
  dokter: "ahmad",
  nama_pasien: "intan",
});

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/v1/api/kontrol/create-kontrol",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzIzMDA0MDAzLCJpYXQiOjE3MjMwMDA0MDMsImlzcyI6Imh0dHBzOi8vbXVrbXpoc2JlYXNrZWN0cGh5d3Iuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjlkNzQ3NzVkLTI5ODktNGI5Ny05NDY3LWUyNGVmM2Q2YTc0YyIsImVtYWlsIjoiYWhtYWRAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6e30sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3MjMwMDA0MDN9XSwic2Vzc2lvbl9pZCI6IjYzNmY5NWMzLTQyNmYtNGU3Yi04MWVhLTJhY2ZlMzcxNGZjNSJ9.tDp59M0wMbejBqhOD0QHbGz6-z-J5UEpEOgEZNfP6t8",
    "Content-Length": Buffer.byteLength(testData),
  },
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);

  let body = "";
  res.on("data", (chunk) => {
    body += chunk;
  });

  res.on("end", () => {
    console.log("Response:", body);
  });
});

req.on("error", (error) => {
  console.error("Request error:", error);
});

req.write(testData);
req.end();
