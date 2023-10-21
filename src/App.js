import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [toggleAll, setToggleAll] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hoverAuth, setHoverAuth] = useState(false);
  const [hoverPrimary, setHoverPrimary] = useState(false);
  const [hoverSecondary, setHoverSecondary] = useState(false);
  const [hoverBack, setHoverBack] = useState(false);
  const [hoverSelectAll, setHoverSelectAll] = useState(false);
  const [hoverGetMatches, setHoverGetMatches] = useState(false);
  const [hoverDeleteMatches, setHoverDeleteMatches] = useState(false);
  const [clickAuth, setClickAuth] = useState(false);
  const [clickPrimary, setClickPrimary] = useState(false);
  const [clickSecondary, setClickSecondary] = useState(false);
  const [clickBack, setClickBack] = useState(false);
  const [clickSelectAll, setClickSelectAll] = useState(false);
  const [clickGetMatches, setClickGetMatches] = useState(false);
  const [clickDeleteMatches, setClickDeleteMatches] = useState(false);

  const selectedCount = Object.values(selectedUsers).filter(Boolean).length;

  function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
        .toUpperCase()
    );
  }

  const deleteMatches = async () => {
    const selectedMatchIds = Object.keys(selectedUsers).filter(
      (id) => selectedUsers[id]
    );

    if (selectedMatchIds.length === 0) {
      console.log("No matches selected to delete.");
      return;
    }

    try {
      const apiUrl = "http://localhost:3000/api/deleteMatches";
      const headers = {
        "Content-Type": "application/json",
        "x-auth-token": authToken, // Send the authToken in headers
      };

      const response = await axios.post(
        apiUrl,
        { matchIds: selectedMatchIds },
        { headers }
      ); // Sending matchIds to the server

      if (response.status === 200) {
        console.log(response.data.message);
      } else {
        console.error("Failed to delete matches:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to delete matches:", error);
    }

    // Refresh the matches after deletion
    fetchUsers();

    for (let id in selectedUsers) {
      selectedUsers[id] = false;
    }
  };

  const hoverStylePrimary = {
    backgroundColor: hoverPrimary
      ? clickPrimary
        ? darkenColor("#007AFF", -35)
        : darkenColor("#007AFF", -15)
      : "#007AFF",
  };

  const hoverStyleSecondary = {
    backgroundColor: hoverSecondary
      ? clickSecondary
        ? darkenColor("#007AFF", -35)
        : darkenColor("#007AFF", -15)
      : "#007AFF",
  };

  const hoverStyleBack = {
    backgroundColor: hoverBack
      ? clickBack
        ? darkenColor("#007AFF", -35)
        : darkenColor("#007AFF", -15)
      : "#007AFF",
  };

  const hoverStyleAuth = {
    backgroundColor: hoverAuth
      ? clickAuth
        ? darkenColor("#007AFF", -35)
        : darkenColor("#007AFF", -15)
      : "#007AFF",
  };

  const hoverStyleSelectAll = {
    backgroundColor: hoverSelectAll
      ? clickSelectAll
        ? darkenColor("#007AFF", -35)
        : darkenColor("#007AFF", -15)
      : "#007AFF",
  };

  const hoverStyleGetMatches = {
    backgroundColor: hoverGetMatches
      ? clickGetMatches
        ? darkenColor("#007AFF", -35)
        : darkenColor("#007AFF", -15)
      : "#007AFF",
  };

  const hoverStyleDeleteMatches = {
    backgroundColor:
      selectedCount === 0 // Check if no users are selected
        ? "#D3D3D3" // Grey color when disabled
        : hoverDeleteMatches
        ? clickDeleteMatches
          ? darkenColor("#FF4D4D", -35)
          : darkenColor("#FF4D4D", -15)
        : "#FF4D4D",
    cursor: selectedCount === 0 ? "not-allowed" : "pointer", // change cursor based on disabled state
  };

  const handleBackButtonPress = () => {
    // Reset application state when going back
    setIsAuthenticated(false);
    setUsers([]);
    setFilter(null);
    setStartDate(null);
    setEndDate(null);
    setToggleAll(false);
    setSelectedUsers({});
    setAuthToken("");
    setAuthError(null);
  };

  const authenticateUser = async () => {
    try {
      // Define the authentication URL as your server's endpoint
      const authUrl = "http://localhost:3000/api/matches"; // Replace with your server's URL

      const headers = {
        "x-auth-token": authToken, // Replace with your actual auth token
      };

      // Send a GET request to your server, which will act as a proxy to the external API
      const response = await axios.get(authUrl, { headers });

      // Check if the response status is 200
      if (response.status === 200) {
        // Authentication successful
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        // Authentication failed
        setIsAuthenticated(false);
        setAuthError("Invalid token or an error was encountered.");
      }
    } catch (error) {
      // Handle any errors that occur during authentication
      setIsAuthenticated(false);
      setAuthError("Invalid token or an error was encountered.");
    }
  };

  const fetchUsers = async () => {
    try {
      const apiUrl = "http://localhost:3000/api/fetchUsers";

      const headers = {
        "x-auth-token": authToken,
      };

      const response = await axios.get(apiUrl, { headers });

      if (response.status === 200) {
        const userData = response.data;
        setUsers(userData);
        setTotalUsers(userData.length);
      } else {
        console.error("Failed to fetch user data:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const toggleSwitch = (id) => {
    // Toggle the selected state of a user
    setSelectedUsers((prevSelectedUsers) => ({
      ...prevSelectedUsers,
      [id]: !prevSelectedUsers[id],
    }));
  };

  const filteredUsers = users.filter((user) => {
    // Apply message filter
    if (filter === "withMessages" && !user.hasMessage) return false;
    if (filter === "withoutMessages" && user.hasMessage) return false;

    // Apply date filters
    if (startDate && new Date(user.created_date) < startDate) return false;
    if (endDate && new Date(user.created_date) > endDate) return false;

    return true;
  });

  useEffect(() => {
    // Handle any necessary side effects when the selected users change
  }, [selectedUsers]);

  useEffect(() => {
    // Handle any necessary side effects when the filter, startDate, or endDate change
  }, [filter, startDate, endDate]);

  return (
    <div style={styles.appContainer}>
      {!isAuthenticated ? (
        <>
          <div style={styles.centerContainer}>
            <div style={styles.parentContainer}>
              <div style={styles.authContainer}>
                <div style={styles.rowContainer}>
                  <p>Enter your tinder x-auth-token:</p>
                  <input
                    style={styles.inputField}
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="e.g. ecbe4042-a628-4bad-a985-fedcb724cfde"
                  />
                  <button
                    style={{ ...styles.btnAuthenticate, ...hoverStyleAuth }}
                    onMouseEnter={() => setHoverAuth(true)}
                    onMouseLeave={() => setHoverAuth(false)}
                    onMouseDown={() => setClickAuth(true)} // set click state when button is pressed
                    onMouseUp={() => setClickAuth(false)}
                    onClick={authenticateUser}
                  >
                    Authenticate
                  </button>
                </div>

                {authError && <p style={styles.errorMessage}>{authError}</p>}
              </div>
            </div>
            <div style={styles.helpContainer}>
              <p>
                For help on how to obtain your tinder x-auth-token, please visit
                the link below:
              </p>
              <button
                style={styles.btnLink}
                onClick={() =>
                  window.open("https://appextension.wordpress.com/", "_blank")
                }
              >
                How to obtain token
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={styles.leftSidebar}>
            <div style={styles.backButtonContainer}>
              <button
                onClick={handleBackButtonPress}
                style={{ ...styles.btnBack, ...hoverStyleBack }}
                onMouseEnter={() => setHoverBack(true)}
                onMouseLeave={() => setHoverBack(false)}
                onMouseDown={() => setClickBack(true)} // set click state when button is pressed
                onMouseUp={() => setClickBack(false)}
              >
                Back
              </button>
            </div>
            <div>
              <button
                style={{ ...styles.btnGetMatches, ...hoverStyleGetMatches }}
                onMouseEnter={() => setHoverGetMatches(true)}
                onMouseLeave={() => setHoverGetMatches(false)}
                onMouseDown={() => setClickGetMatches(true)} // set click state when button is pressed
                onMouseUp={() => setClickGetMatches(false)}
                onClick={fetchUsers}
              >
                Get Matches
              </button>
            </div>
            <div style={styles.card}>
              <div style={styles.toggleButtonContainer}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  style={{ ...styles.btnSecondary, ...hoverStyleSecondary }}
                  onMouseEnter={() => setHoverSecondary(true)}
                  onMouseLeave={() => setHoverSecondary(false)}
                  onMouseDown={() => setClickSecondary(true)} // set click state when button is pressed
                  onMouseUp={() => setClickSecondary(false)}
                >
                  Toggle Filters
                </button>
              </div>
              <div
                style={
                  showFilters
                    ? styles.filterContainerExpanded
                    : styles.filterContainerCollapsed
                }
              >
                {showFilters && (
                  <div style={styles.filters}>
                    <div style={styles.filterRow}>
                      <label style={styles.filterLabel}>Filter:</label>
                      <select
                        style={{ ...styles.inputField, ...styles.selectField }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value={null}>No Filter</option>
                        <option value="withMessages">With Messages</option>
                        <option value="withoutMessages">
                          Without Messages
                        </option>
                      </select>
                    </div>

                    <div style={styles.filterRow}>
                      <label style={styles.filterLabel}>Start Date:</label>
                      <div
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        <input
                          style={styles.inputField}
                          type="date"
                          value={
                            startDate
                              ? startDate.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setStartDate(new Date(e.target.value))
                          }
                        />
                        {startDate && (
                          <span
                            style={{ cursor: "pointer", marginLeft: "10px" }}
                            onClick={() => setStartDate(null)}
                          >
                            X
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={styles.filterRow}>
                      <label style={styles.filterLabel}>End Date: </label>
                      <div
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        <input
                          style={styles.inputField}
                          type="date"
                          value={
                            endDate ? endDate.toISOString().split("T")[0] : ""
                          }
                          onChange={(e) => setEndDate(new Date(e.target.value))}
                        />
                        {endDate && (
                          <span
                            style={{ cursor: "pointer", marginLeft: "10px" }}
                            onClick={() => setEndDate(null)}
                          >
                            X
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <button
                  style={{ ...styles.btnSelectAll, ...hoverStyleSelectAll }}
                  onMouseEnter={() => setHoverSelectAll(true)}
                  onMouseLeave={() => setHoverSelectAll(false)}
                  onMouseDown={() => setClickSelectAll(true)} // set click state when button is pressed
                  onMouseUp={() => setClickSelectAll(false)}
                  onClick={() => {
                    if (toggleAll) {
                      setSelectedUsers({}); // deselect all
                    } else {
                      const allUsersSelected = {};
                      filteredUsers.forEach(
                        (user) => (allUsersSelected[user.id] = true)
                      );
                      setSelectedUsers(allUsersSelected); // select all
                    }
                    setToggleAll(!toggleAll);
                  }}
                >
                  {toggleAll ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div style={styles.counts}>
                <p>Total: {users.length}</p>
                <p>Filtered: {filteredUsers.length}</p>
                <p>Selected: {selectedCount}</p>
              </div>
            </div>
          </div>
          <div style={styles.mainContent}>
            <div style={styles.userList}>
              {filteredUsers.map((user) => (
                <div key={user.id} style={styles.userCard}>
                  <img
                    style={styles.listItemAvatar}
                    src={user.person.photos[0].url}
                    alt="User Avatar"
                  />
                  <p style={styles.listItemTitle}>{user.person.name}</p>
                  {user.hasMessage && (
                    <p style={{ color: "green" }}>has messages</p>
                  )}
                  <input
                    type="checkbox"
                    checked={selectedUsers[user.id] || false}
                    onChange={() => toggleSwitch(user.id)}
                  />
                </div>
              ))}
            </div>
            <div style={styles.rightSidebar}>
              <button
                style={{ ...styles.btnDelete, ...hoverStyleDeleteMatches }}
                onMouseEnter={() => {
                  setHoverDeleteMatches(true);
                }}
                onMouseLeave={() => {
                  setHoverDeleteMatches(false);
                }}
                onMouseDown={() => setClickDeleteMatches(true)} // set click state when button is pressed
                onMouseUp={() => setClickDeleteMatches(false)}
                onClick={() => {
                  if (selectedCount > 0) {
                    if (
                      window.confirm(
                        "Are you sure you want to delete the selected matches?"
                      )
                    ) {
                      deleteMatches();
                    }
                  }
                }}
                disabled={selectedCount === 0}
              >
                Delete Matches
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

const styles = {
  listItemAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "25px",
    marginRight: "10px",
  },
  listItemTitle: {
    fontWeight: "bold",
  },

  appContainer: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f7f7f7",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh", // Ensure minimum height
    flexGrow: 1,
  },
  parentContainer: {
    display: "flex",
    justifyContent: "center", // Center horizontally
    alignItems: "center", // Center vertically
    transform: "translateY(-1%)", // Full viewport height
  },
  helpContainer: {
    marginTop: 30, // Adjust as needed
    textAlign: "center",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  authContainer: {
    maxWidth: 800,
    margin: "0 auto",
    padding: 30,
    backgroundColor: "#fff",
    boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
  },
  centerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  rowContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15, // Some margin to space it from the elements below
    padding: 10, // This will add padding around the entire container
  },

  mainContent: {
    padding: 30,
    marginLeft: 327,
    maxWidth: 800,
    margin: "0 auto",
  },

  userList: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // 3 cards in a row
    gap: 20,
  },
  userCard: {
    padding: 10,
    width: "250px",
    backgroundColor: "#fff",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
    borderRadius: 15,
  },
  btnAuthenticate: {
    backgroundColor: "#007AFF",
    color: "white",
    border: "none",
    borderRadius: "7px",
    padding: "6px 20px",
    cursor: "pointer",
    outline: "none",
    marginLeft: "6px", // <-- added separation
  },
  errorMessage: {
    width: "100%", // Take up the full width of the container
    textAlign: "center", // Center the text within the div
    color: "red",
  },
  btnSecondary: {
    backgroundColor: "#007AFF",
    color: "white",
    padding: "6px 15px",
    border: "none",
    marginBottom: "15px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  btnGetMatches: {
    backgroundColor: "#007AFF",
    color: "white",
    padding: "6px 15px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  btnLink: {
    backgroundColor: "transparent",
    color: "#007AFF",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textDecoration: "underline",
    boxShadow: "none", // No shadow for link buttons
  },
  btnBack: {
    backgroundColor: "#555",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "6px 15px",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.3s ease",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  btnSelectAll: {
    backgroundColor: "#555",
    color: "white",
    border: "none",
    borderRadius: "6px",
    marginBottom: "30px",
    padding: "6px 15px",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.3s ease",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  btnDelete: {
    backgroundColor: "#FF4D4D", // Assuming you want a red delete button
    color: "white",
    padding: "8px 15px",
    marginTop: "35px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.3s ease",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  leftSidebar: {
    position: "fixed", // Fix position
    left: 20, // 20px from the left side of the viewport
    top: 20, // 20px from the top
    display: "flex",
    flexDirection: "column", // Stack items vertically
    gap: 100, // Spacing between items
    zIndex: 1, // To ensure it remains above other content
    //justifyContent: "center",
    //borderRight: "1px solid #ddd",
    left: 35,
    top: 50,
    bottom: 0,
  },

  rightSidebar: {
    // You can adjust this as per your needs
    position: "fixed",
    right: 0,
    top: 0,
    bottom: 0,
    width: "200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    //justifyContent: "center",
    backgroundColor: "#f7f7f7",
    borderLeft: "1px solid #ddd",
    paddingLeft: "10px",
  },
  filterContainerExpanded: {
    marginBottom: "24px", // This is an example; you might not need anything here if there's no difference in styles
  },

  filterContainerCollapsed: {
    marginBottom: "112px", // This is a guess, you'll need to adjust this value to create the buffer
  },
  counts: {
    marginLeft: "5px",
  },
  filters: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterLabel: {
    marginRight: "10px",
    marginLeft: "5px",
  },
  inputField: {
    width: "116px", // this applies to both select and input by default
    margin: "0 15px", // This will add 10px margin to the left and right of the input field
    padding: "5px 20px", // Optional: You can also add padding inside the input box for better aesthetics
    borderRadius: "4px", // Optional: You can add this to give the input field rounded corners
    border: "1px solid #ccc",
  },
  selectField: {
    width: "158px", // set this specifically for the select
  },
};
