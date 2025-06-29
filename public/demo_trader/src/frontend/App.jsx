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
  History_Icon,
} from "./icons";
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
} from "../api"; // Import the API functions

// Renders the Add Wallet popup modal
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

// Renders the sidebar with wallet selection and actions
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

// Renders a shadow effect based on total change
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
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "10px",
        pointerEvents: "none",
        boxShadow: `0px 20px 1000px 0px ${totalChange < 0 ? "#ff4d4d" : "#4dff4d"}`,
        zIndex: 1,
        background: "transparent",
      }}
    ></div>
  );
}

// Custom hook to detect dark mode on the body
function useBodyDarkMode() {
  const [isDark, setIsDark] = useState(null);
  useEffect(() => {
    setIsDark(document.body.classList.contains("dark-mode"));
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains("dark-mode"));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

// Renders the app header with profile and gas info
function Header(props) {
  const isDarkMode = useBodyDarkMode();
  if (isDarkMode === null) return null;
  return (
    <div className="App-header">
      <img
        src={isDarkMode ? "https://cdn.discordapp.com/attachments/1384964251524792433/1388584703178571936/ChatGPT_Image_Jun_28__2025__07_14_27_PM-removebg-preview.png?ex=686183c7&is=68603247&hm=fb06a1c80a77d3092dd8b348684e8304d39cd3fbc4ebfea60d2830c601992f2c&" : "https://cdn.discordapp.com/attachments/1384964251524792433/1388539462090231888/ChatGPT_Image_Jun_28_2025_04_19_54_PM.png?ex=686159a5&is=68600825&hm=c8fa8a67df1572e1f0899c60744780d84b52c1799769ef03077af21e8b0423b5&"}
        alt="profile-pic"
        onClick={props.SetActiveSidebar}
        style={{ cursor: "pointer" }}
      />
      <div className="Details">
        <p style={{ margin: 0,paddingTop: "5px" }}>@althass</p>
        <p
          style={{
            ...(isDarkMode
              ? { color: "#ffffff", fontSize: "1.1em" }
              : { color: "black", fontSize: "1.1em" })
          }}
        >
          Main
        </p>
      </div>
      <div className="Gas">
        0.004
        <div className="GasIcon">
        <Gas walletsUpdated={props.walletsUpdated}/>
        </div>
      </div>
    </div>
  );
}

// Renders a button for swap/history navigation
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

// Renders a single coin with price and change
export function Coin(props) {
  const priceChangeValue = props.pricechange * props.amount;
  const formattedPriceChange = `${priceChangeValue < 0 ? "-" : "+"}$${Math.abs(
    priceChangeValue
  ).toFixed(4)}`;

  const isDarkMode = useBodyDarkMode();

  return (
    <>
      <div className="Coin-Wrapper">
        <div className="Coin-Icon">
          <img src={props.logo} alt="SOL" />
        </div>
        <div className="Coin-Name">
          <h3 style={isDarkMode ? { color: "white" }: {color: "black"}}>{props.Name}</h3>
          <p>
            {props.amount.toFixed(4)}: {props.Symbol}
          </p>
        </div>
        <div className="Coin-Price">
          <h3>${(props.amount * props.USDPrice).toFixed(2)}</h3>
          <p style={isDarkMode ? { color: priceChangeValue < 0 ? "#ff4d4d" : "#4dff4d" } : { color: priceChangeValue < 0 ? "#ff4d4d" : "#0d8258" }}>
            {formattedPriceChange}
          </p>
        </div>
      </div>
    </>
  );
}

// Renders the list of coins in the portfolio
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
  }, [props.updatedCoins,props.activeWallet]);

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

// Renders the balance, change, and swap/history buttons
function Balance(props) {
  const [totalBalance, setTotalBalance] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [error, setError] = useState(null);
  const isDarkMode = useBodyDarkMode();

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
          <h1 style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>${totalBalance.toFixed(2)}</h1>
          <div className="App-balance-change">
            <h2
              id="change"
              style={isDarkMode ? { color: totalChange < 0 ? "#ff4d4d" : "#4dff4d" } : { color: totalChange < 0 ? "#ff4d4d" : "#0d8258" }}
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
                style={isDarkMode ? { color: percentChange < 0 ? "#ff4d4d" : "#4dff4d" } : { color: percentChange < 0 ? "#ff4d4d" : "#0d8258" }}
              >
                {percentChange < 0 ? "-" : "+"}
                {Math.abs(percentChange).toFixed(2)}%
              </h2>
            </div>
          </div>
        </div>
        <div className="Swap-Buttons">
          <Swap_Button name="Swap" icon={Swap_Icon()} to="/Swap" />
          <Swap_Button name="History" icon={History_Icon()} to="/History" />
        </div>
      </div>
    </>
  );
}

// Renders the main body with balance and coins
function Body(props) {
  const isDarkMode = useBodyDarkMode();
  return (
    <>
      <div className="App-Body">
        <Balance walletsUpdated={props.walletsUpdated} activeWallet={props.activeWallet}/>
        <Coins updatedCoins={props.updatedCoins} activeWallet={props.activeWallet}/>
      </div>
    </>
  );
}

// Navigation helper for footer items
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

// Renders the app footer with navigation
function Footer() {
  const location = useLocation();
  const [pos, changepos] = useState("17.5%");

  useEffect(() => {
    if (location.pathname === "/Swap") {
      changepos("45%"); 
    } else if (location.pathname === "/index.html") {
      changepos("10%");
    } else {
      changepos("80%"); 
    }
  }, [location.pathname]);

  return (
    <>
      <div className="App-footer">
        <div
          className="Topper"
          style={{ left: pos }}
        ></div>
        {<Naviagate_to item={SVGComponent()} to={"/index.html"} />}
        {<Naviagate_to item={Swap_Footer()} to={"/Swap"} />}
        {<Naviagate_to item={History()} to={"/History"} />}
      </div>
    </>
  );
}

// Main App component, manages state and layout
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


    async function update() {
      try {
        const updateMessage = await UpdateJSON();
        coinsUpdate((prev) => !prev);
        console.log("Update result:", updateMessage);
      } catch (error) {
        console.error("Error updating JSON:", error);
      }
    }

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
          <div></div> 
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
