const net = require("net");
const fs = require("fs");
const path = require("path");
const readline = require("readline-sync");

const HOST = "127.0.0.1";
const PORT = 1337;

let requestedFileName = "test-file.txt"; // to receive
let receivedFileName = `received-${requestedFileName}`;

let receivedData; // write stream

let state = "BEFORE-FILE-REQUEST";

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log(`Connected to server at ${HOST}:${PORT}`);

  client.on("data", (data) => {
    const { type, response } = handleServerResponse(data);

    if (type == "file-request") {
      requestedFileName = response;
      client.write(requestedFileName, "utf-8");
      console.log("File request sent.");
    }

    if (type == "data") {
      if (!receivedData) {
        receivedData = fs.createWriteStream(
          path.join(__dirname, "Client Data", receivedFileName)
        );
      }

      receivedData.write(response);
    }
  });

  client.on("close", () => {
    console.log("Received all data.");
    receivedData.close(() => {
      console.log("File saved successfully.");
    });

    console.log("Connection closed.");

    state = "BEFORE-FILE-REQUEST"; // ready for new file
  });
});

function handleServerResponse(data) {
  if (state == "BEFORE-FILE-REQUEST") {
    console.log("Files available on the server: ");

    const message = eval(data.toString("utf-8")); // gives list
    console.log(message);

    let requestedFile = readline.question("Enter file to request: ");
    while (!message.includes(requestedFile)) {
      requestedFile = readline.question(
        "File not present in server. Enter file to request: "
      );
    }

    state = "FILE-REQUEST-SENT";

    return { type: "file-request", response: requestedFile };
  }
  if (state == "FILE-REQUEST-SENT") {
    console.log("Receiving data from server...");

    return { type: "data", response: data };
  }
}
