const express = require("express");
const app = express();

app.use((req, res, next) => {
    const {url, method} = req;
    console.log(`API req recieved : ${url} ${method} `);
    next();
})

// Simulate ECONNABORTED (client aborts request)
app.get("/abort", (req, res) => {
  req.destroy(); // This forces the connection to be closed
});

// Simulate ECONNREFUSED (refusing connection)
app.get("/refuse", (req, res) => {
  res.status(500).send("Connection refused (ECONNREFUSED)"); // Simulating refusal
});

// Simulate ETIMEDOUT (request timeout)
app.get("/timeout", (req, res) => {
  // Simulate a long delay before responding (e.g., timeout)
  setTimeout(() => {
    res.status(200).send("This request took too long!");
  }, 10000); // 10-second delay
});

// Simulate 503 Service Unavailable
app.get("/unavailable", (req, res) => {
  res.status(503).send("503 Service Unavailable");
});

// Simulate 429 Too Many Requests
let requestCount = 0;
app.get("/too-many-requests", (req, res) => {
  requestCount++;
  if (requestCount > 5) {
    res.status(429).send("429 Too Many Requests");
  } else {
    res.status(200).send("Request accepted");
  }
});

// Simulate 502 Bad Gateway
app.get("/bad-gateway", (req, res) => {
  res.status(502).send("502 Bad Gateway");
});

// Create a server that refuses connections to simulate ECONNREFUSED
const port = 9000;
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Close the server after 5 requests to simulate refusal (ECONNREFUSED)
let connectionCount = 0;
server.on("connection", (socket) => {
  connectionCount++;
  if (connectionCount > 10) {
    socket.destroy(); // Destroying connections after 5 requests simulates refusal
  }
});

// Simulate closing the server after a timeout
setTimeout(() => {
  server.close(() => {
    console.log("Server closed after timeout");
  });
}, 30000); // Close server after 30 seconds
