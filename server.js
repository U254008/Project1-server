const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the cors middleware
const app = express();
const port = process.env.PORT || 3000; // Use the environment variable PORT or fallback to 3000

const corsOptions = {
  //origin: "http://localhost:3001", // Replace with the actual origin of your client
  // origin: "https://bulkaction.io",
  origin: "https://glorious-spoon-r44xpvjw99wp265v-3000.app.github.dev/",
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

// const MongoClient = require("mongodb").MongoClient;
// const uri =
//   "mongodb+srv://User1:User100@cluster0.gq855ck.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// let logCollection; // We will assign the collection object to this variable after connection

// client.connect((err) => {
//   if (err) throw err;
//   logCollection = client.db("test").collection("functionLogs");
//   app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//   });
// });

// function logFunctionUsage(functionName, parameters) {
//   if (!logCollection) return;
//   logCollection.insertOne(
//     {
//       functionName: functionName,
//       parameters: parameters, // parameters is an object now, to handle multiple types of parameters more easily
//       timestamp: new Date(),
//     },
//     (err, result) => {
//       if (err) {
//         console.error("Error saving log to MongoDB:", err);
//       }
//     }
//   );
// }

// Define a route for proxying requests to the external API
app.get("/api/matches", async (req, res) => {
  // logFunctionUsage("/api/matches", {
  //   matchIds: null,
  //   authToken: req.headers["x-auth-token"],
  // });

  try {
    const authToken = req.headers["x-auth-token"];

    const response = await axios.get(
      "https://api.gotinder.com/v2/matches?count=1",
      {
        headers: {
          "x-auth-token": authToken, // Include your authentication token if required
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// Define a route for fetching user data
app.get("/api/fetchUsers", async (req, res) => {
  // logFunctionUsage("/api/fetchUsers", {
  //   matchIds: null,
  //   authToken: req.headers["x-auth-token"],
  // });

  const allUsers = [];
  const messageList = [0, 1];

  try {
    const authToken = req.headers["x-auth-token"];

    if (!authToken) {
      return res.status(401).json({ error: "Authentication token is missing" });
    }

    const headers = {
      "x-auth-token": authToken,
    };

    for (const message of messageList) {
      let stop = false;
      let nextPageToken = null;

      while (!stop) {
        let apiUrl = `https://api.gotinder.com/v2/matches?count=100&message=${message}`;

        if (nextPageToken) {
          apiUrl += `&page_token=${nextPageToken}`;
        }

        const response = await axios.get(apiUrl, { headers });

        if (response.status === 200) {
          const data = response.data.data.matches;
          allUsers.push(
            ...data.map((user) => ({ ...user, hasMessage: !!message }))
          );

          if (data.length === 0) {
            stop = true;
          } else {
            nextPageToken = response.data.data.next_page_token;
          }
        } else {
          console.error(
            `Failed to get data from external API: ${response.status}`
          );
          stop = true;
        }
      }
    }

    res.json(allUsers);
  } catch (error) {
    console.error("Error in fetchUsers:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/api/deleteMatches", async (req, res) => {
  // logFunctionUsage("/api/deleteMatches", {
  //   matchIds: req.body.matchIds,
  //   authToken: req.headers["x-auth-token"],
  // });

  const matchIds = req.body.matchIds;
  const authToken = req.headers["x-auth-token"]; // Extracting authToken from headers

  if (!matchIds || matchIds.length === 0) {
    return res.status(400).json({ error: "No match IDs provided" });
  }

  if (!authToken) {
    return res.status(401).json({ error: "Authentication token is missing" });
  }

  const headers = {
    "x-auth-token": authToken,
  };

  for (const matchId of matchIds) {
    const apiUrl = `https://api.gotinder.com/user/matches/${matchId}`;
    try {
      await axios.delete(apiUrl, { headers });
    } catch (error) {
      console.error(`Failed to delete match ${matchId}:`, error);
      return res
        .status(500)
        .json({ error: `Failed to delete match ${matchId}` });
    }
  }

  res.status(200).json({ message: "Matches deleted successfully" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
