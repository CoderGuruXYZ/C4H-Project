import { useNavigate, useLocation } from "react-router-dom";
import * as React from "react";
import { useState, useEffect } from "react";
import "./App.css";
import {
  Profile,
  Recieve_Icon,
  Send_Icon,
  Swap_Icon,
  Buy_Icon,
  SVGComponent,
  Swap_Footer,
  Gas,
  Backarrow,
  Settings,
  Edit,
  Add,
  History,
} from "./icons.jsx";
import {
  getTotalBalance,
  getPortfolio,
  initializeMoralis,
  UpdateJSON,
  getTotalChange,
  getWallets,
  getActiveWallet,
  changeActiveWallet,
  addWallet,
} from "../api.js"; // Import the API functions

// AddWalletPopup component to handle adding new wallets
const AddWalletPopup = ({ isOpen, onClose, onAddWallet }) => {
  const [walletName, setWalletName] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    try {
      if (!walletName.trim()) {
        throw new Error("Wallet name cannot be empty");
      }
      onAddWallet(walletName.trim());
      setWalletName("");
      onClose();
    } catch (err) {
      console.error(err);
      setError("Please enter a valid wallet name.");
    }
  };

  return (
    <div className="popupOverlay">
      <div className="popup">
        <div className="popupHeader">
          <h3>Add Wallet</h3>
          <button className="closeButton" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="searchContainer">
          <input
            type="text"
            placeholder="Add Wallet"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            className="searchInput"
          />
          {error && <p className="errorText">{error}</p>}
        </div>

        <button className="Select" onClick={handleSubmit}>
          Submit
        </button>

        <button className="closeBottomButton" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

// Sidebar component to display the list of wallets
function Sidebar(props) {
  const [Wallets, setWallets] = useState([]);

  const handleClick = async (wallet) => {
    if (props.activeWallet === wallet["Wallet-Name"]) {
      return;
    }

    props.SetActiveWallet(wallet["Wallet-Name"]);
    props.SetActiveSidebar(false);
  };

  useEffect(() => {
    async function fetchData() {
      const data = await getWallets();
      if (data) {
        setWallets(data);
      }
    }
    fetchData();
  }, [props.walletsUpdated]);

  return (
    <div
      className="Sidebar-Popup"
      style={{ display: props.activeSidebar ? "flex" : "none" }}
    >
      <Backarrow SetActiveSidebar={props.SetActiveSidebar} />
      {Wallets.map((wallet) => (
        <div className="Wallet-Icon" key={wallet["Wallet-Name"]}>
          <div
            onClick={() => {
              handleClick(wallet);
            }}
            className="Wallet-wrapper"
            style={{
              backgroundColor:
                props.activeWallet === wallet["Wallet-Name"]
                  ? "#ab9ff2"
                  : "#2a2a2a",
              cursor: "pointer",
            }}
          >
            {wallet["Wallet-Name"][0]}
          </div>
          <div className="Wallet-Name" style={{ fontSize: "12px" }}>
            {wallet["Wallet-Name"]}
          </div>
        </div>
      ))}
      <div className="Sidebar-Functions">
        <div>
          <div
            style={{ cursor: "pointer", padding: "4px" }}
            onClick={props.setActive}
          >
            <Add />
          </div>
          <div style={{ cursor: "pointer", padding: "4px" }}>
            <Edit />
          </div>
          <div style={{ cursor: "pointer", padding: "4px" }}>
            <Settings />
          </div>
        </div>
      </div>
    </div>
  );
}

// Shadow component to display a shadow effect based on total change
function Shadow(props) {
  const [totalChange, setTotalChange] = useState(0);

  useEffect(() => {
    async function fetchChange() {
      let change = await getTotalChange();
      if (change !== undefined && change !== null) {
        setTotalChange(change);
      }
    }

    fetchChange(); // Initial fetch
    const intervalId = setInterval(fetchChange, 1000); // Correctly set interval

    return () => clearInterval(intervalId); // Properly clear interval
  }, [props.walletsUpdated, props.activeWallet]); // totalChange removed to avoid loop

  return (
    <div
      className="Shadow"
      style={{
        boxShadow: `${totalChange < 0 ? "#ff4d4d" : "#4dff4d"} 0px 0px 20vh`,
      }}
    ></div>
  );
}

// Header component to display the header with profile picture and gas fee
function Header(props) {
  return (
    <div className="App-header">
      <img
        src="https://icon2.cleanpng.com/20180602/vww/avotf2bd2.webp"
        alt="profile-pic"
        onClick={props.SetActiveSidebar}
        style={{ cursor: "pointer" }}
      />
      <div className="Details">
        <p>@althass</p>
        <p style={{ color: "#ffffff", fontSize: "1.1em" }}>Main</p>
      </div>
      <div className="Gas">
        0.004
        <Gas walletsUpdated={props.walletsUpdated} />
      </div>
    </div>
  );
}

// Swap_Button component to handle navigation and actions
function Swap_Button(props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (props.to) {
      navigate(props.to);
    } else if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <button className="Swap-Button" onClick={handleClick}>
      {props.icon}
      <div>{props.name}</div>
    </button>
  );
}

// Component to display individual coin details
export function Coin(props) {
  const priceChangeValue = props.pricechange * props.amount;
  const formattedPriceChange = `${priceChangeValue < 0 ? "-" : "+"}$${Math.abs(
    priceChangeValue
  ).toFixed(4)}`;

  return (
    <>
      <div className="Coin-Wrapper">
        <div className="Coin-Icon">
          <img src={props.logo} alt="SOL" />
        </div>
        <div className="Coin-Name">
          <h3 style={{ color: "white" }}>{props.Name}</h3>
          <p>
            {props.amount.toFixed(4)}: {props.Symbol}
          </p>
        </div>
        <div className="Coin-Price">
          <h3>${(props.amount * props.USDPrice).toFixed(2)}</h3>
          <p style={{ color: priceChangeValue < 0 ? "#ff4d4d" : "#4dff4d" }}>
            {formattedPriceChange}
          </p>
        </div>
      </div>
    </>
  );
}

// Component to display all coins
export function Coins(props) {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getPortfolio();
      if (data) {
        setCoins(data.coins);
      }
    }
    fetchData();
  }, [props.updatedCoins, props.activeWallet]);

  return (
    <>
      <div className="Coins-Wrapper">
        {coins.map((coin) => {
          return (
            <Coin
              pricechange={coin.PriceChange}
              amount={coin.amount}
              key={coin.Symbol}
              Name={coin.Name}
              Symbol={coin.Symbol}
              logo={coin.logo}
              USDPrice={coin.USDPrice}
            />
          );
        })}
      </div>
    </>
  );
}

// Component to display the total balance and change
function Balance(props) {
  const [totalBalance, setTotalBalance] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function updateAndFetchBalance() {
      try {
        const total = await getTotalBalance();
        const change = await getTotalChange();

        console.log("Received total balance:", total);
        console.log("Received total change:", change);

        const percentage_change =
          change !== 0 ? (change / (total - change)) * 100 : 0;

        if (total !== undefined && total !== null) {
          setTotalBalance(total);
        }

        if (change !== undefined && change !== null) {
          setTotalChange(change);
        }

        if (
          percentage_change !== undefined &&
          percentage_change !== null &&
          !isNaN(percentage_change)
        ) {
          setPercentChange(percentage_change);
        }
      } catch (err) {
        console.error("Error in updateAndFetchBalance:", err);
        setError(err.message);
      }
    }

    updateAndFetchBalance();
    const interval = setInterval(updateAndFetchBalance, 10000);

    return () => clearInterval(interval);
  }, [props.walletsUpdated, props.activeWallet]);

  return (
    <>
      <div className="Balance-Wrapper">
        <div className="App-balance">
          <h1 style={{ color: "#ffffff" }}>${totalBalance.toFixed(2)}</h1>
          <div className="App-balance-change">
            <h2
              id="change"
              style={{ color: totalChange < 0 ? "#ff4d4d" : "#4dff4d" }}
            >
              {totalChange < 0 ? "-" : "+"}${Math.abs(totalChange).toFixed(2)}
            </h2>
            <div
              className="PNL"
              style={{
                backgroundColor:
                  percentChange < 0
                    ? "rgba(60,37,39,1)"
                    : "hsla(144, 79%, 51%, 0.274)",
              }}
            >
              <h2
                id="change"
                style={{ color: percentChange < 0 ? "#ff4d4d" : "#4dff4d" }}
              >
                {percentChange < 0 ? "-" : "+"}
                {Math.abs(percentChange).toFixed(2)}%
              </h2>
            </div>
          </div>
        </div>
        <div className="Swap-Buttons">
          <Swap_Button name="Recieve" icon={Recieve_Icon()} to="" />
          <Swap_Button name="Send" icon={Send_Icon()} to="" />
          <Swap_Button name="Swap" icon={Swap_Icon()} to="/Swap" />
          <Swap_Button name="Buy" icon={Buy_Icon()} to="" />
        </div>
      </div>
    </>
  );
}

// Component to display the body of the application
function Body(props) {
  return (
    <>
      <div className="App-Body">
        <Balance
          walletsUpdated={props.walletsUpdated}
          activeWallet={props.activeWallet}
        />
        <Coins
          updatedCoins={props.updatedCoins}
          activeWallet={props.activeWallet}
        />
      </div>
    </>
  );
}

// Function to Navigate to different routes
function Naviagate_to(props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (props.to) {
      navigate(props.to);
    } else if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <div className="Footer_Item" onClick={handleClick}>
      {props.item}
    </div>
  );
}

// Footer component to display the footer with navigation
function Footer() {
  const location = useLocation();
  const [pos, changepos] = useState("17.5%");

  useEffect(() => {
    if (location.pathname === "/Swap") {
      changepos("70%"); // Active color
    } else if (location.pathname === "/") {
      changepos("17.5%");
    }
  }, [location.pathname]);

  return (
    <>
      <div className="App-footer">
        <div
          className="Topper"
          style={{ left: pos, transition: "left 0.5s ease-in-out" }}
        ></div>
        {<Naviagate_to item={SVGComponent()} to={"/"} />}
        {<Naviagate_to item={Swap_Footer()} to={"/Swap"} />}
        {<Naviagate_to item={History()} to={"/History"} />}
      </div>
    </>
  );
}

// Main App component that combines all the other components
function App() {
  const [activeSidebar, SetActiveSidebar] = useState(false);
  const [activeWallet, SetActiveWallet] = useState("");
  const [isAddWalletPopupOpen, setIsAddWalletPopupOpen] = useState(false);
  const [walletsUpdated, setWalletsUpdated] = useState(false);
  const [updatedCoins, coinsUpdate] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  const handleAddWallet = (walletName) => {
    console.log("Adding wallet:", walletName);
    addWallet(walletName).then(() => {
      setWalletsUpdated((prev) => !prev);
      SetActiveWallet(walletName);
    });
  };

  useEffect(() => {
    async function fetchActiveWallet() {
      try {
        const wallet = await getActiveWallet();
        if (wallet) {
          SetActiveWallet(wallet); // Set the active wallet in state
        } else {
          console.error("No active wallet found");
        }
      } catch (error) {
        console.error("Error fetching active wallet:", error);
      }
    }

    fetchActiveWallet();
  }, []);

  const handleClick = () => SetActiveSidebar((prev) => !prev);
  const handleAdd = () => {
    setIsAddWalletPopupOpen((prev) => !prev);
    SetActiveSidebar((prev) => !prev);
  };

  useEffect(() => {
    async function updateActiveWallet() {
      try {
        setLoading(true); // Start loading
        await changeActiveWallet(activeWallet);
        await UpdateJSON();
        coinsUpdate((prev) => !prev); // Trigger coin updates
      } catch (error) {
        console.error("Error updating active wallet:", error);
      } finally {
        setLoading(false); // End loading
      }
    }

    if (activeWallet) {
      updateActiveWallet();
    }
  }, [activeWallet]);

  useEffect(() => {
    async function initialize() {
      try {
        const message = await initializeMoralis();
        console.log("Moralis initialization:", message);
      } catch (error) {
        console.error("Error initializing Moralis:", error);
      }
    }

    async function update() {
      try {
        const updateMessage = await UpdateJSON();
        coinsUpdate((prev) => !prev);
        console.log("Update result:", updateMessage);
      } catch (error) {
        console.error("Error updating JSON:", error);
      }
    }

    initialize();
    update();

    const interval = setInterval(update, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="Main">
      <Sidebar
        activeSidebar={activeSidebar}
        SetActiveSidebar={handleClick}
        activeWallet={activeWallet}
        SetActiveWallet={SetActiveWallet}
        setActive={handleAdd}
        walletsUpdated={walletsUpdated}
      />
      <div style={{ opacity: activeSidebar ? "25%" : "1" }}>
        <Shadow activeWallet={activeWallet} />
        <Header
          SetActiveSidebar={handleClick}
          walletsUpdated={walletsUpdated}
          activeWallet={activeWallet}
        />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Body
            updatedCoins={updatedCoins}
            walletsUpdated={walletsUpdated}
            activeWallet={activeWallet}
          />
        )}
        <Footer />
      </div>
      <AddWalletPopup
        isOpen={isAddWalletPopupOpen}
        onClose={() => setIsAddWalletPopupOpen(false)}
        onAddWallet={handleAddWallet}
      />
    </div>
  );
}

export { Header, Footer };
export default App;
