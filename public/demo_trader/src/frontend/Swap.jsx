import React from "react";
import { Header, Footer } from "./App.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Swap.module.css";
import { SwapCoin_Icon } from "./icons.jsx";
import {
  getPortfolio,
  getTokenPrice,
  exchangeTokens,
  UpdateJSON,
} from "../api.js";

let Buying_Address;
let Selling_Address;
let Selling_Amount;
let Buying_Amount;


// Code for the Swap page of the trading application ------------------------------------------------------------------------------------------------------------------------------------

// This component displays a list of coins in the user's portfolio and allows them to select a coin for buying or selling. ------------------------------------------------------------------------------------------------------------------------------------
export function Coin(props) {
  const priceChangeValue = props.pricechange * props.amount;
  const formattedPriceChange = `${priceChangeValue < 0 ? "-" : "+"}$${Math.abs(
    priceChangeValue
  ).toFixed(4)}`;

  return (
    <>
      <div
        className={styles.CoinWrapper}
        onClick={() =>
          props.onClick &&
          props.onClick({
            tokenAddress: props.address, // or props.address if available
            logo: props.logo,
            Name: props.Name,
            Symbol: props.Symbol,
            USDPrice: props.USDPrice,
            amount: props.amount,
          })
        }
      >
        <div className={styles.CoinIcon}>
          <img src={props.logo} alt="SOL" />
        </div>
        <div className={styles.CoinName}>
          <h3 style={{ color: "white" }}>{props.Name}</h3>
          <p>
            {props.amount.toFixed(4)}: {props.Symbol}
          </p>
        </div>
        <div className={styles.CoinPrice}>
          <h3>${(props.amount * props.USDPrice).toFixed(2)}</h3>
          <p style={{ color: priceChangeValue < 0 ? "#ff4d4d" : "#4dff4d" }}>
            {formattedPriceChange}
          </p>
        </div>
      </div>
    </>
  );
}

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
  }, []);

  const filteredCoins = coins.filter(
    (coin) =>
      coin.address !== Buying_Address?.address &&
      coin.address !== Selling_Address?.address
  );

  return (
    <div className={styles.CoinsWrapper}>
      {filteredCoins.map((coin) => (
        <Coin
          key={coin.Symbol}
          pricechange={coin.PriceChange}
          amount={coin.amount}
          Name={coin.Name}
          Symbol={coin.Symbol}
          logo={coin.logo}
          USDPrice={coin.USDPrice}
          address={coin.address}
          onClick={() => {
            props.handleclick(coin);
            if (props.isSelling) {
              Selling_Address = coin;
              chrome.runtime.sendMessage({ Selling_Address });
            } else {
              Buying_Address = coin;
              chrome.runtime.sendMessage({ Buying_Address });
            }
          }}
        />
      ))}
    </div>
  );
}


// This component displays a popup for selecting a currency to buy or sell. It includes a search input and a list of coins from the user's portfolio. ------------------------------------------------------------------------------------------------------------------------------------
const CurrencyPopup = ({ isOpen, onClose, isSelling, coins, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <div className={styles.popupHeader}>
          <h3>{isSelling ? "Select token to sell" : "Enter token to buy"}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.coinList}>
          <Coins handleclick={onSelect} />
        </div>

        <button className={styles.closeBottomButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

// This component is a buying popup which consists of an input which can be used to enter a token address which can be used to select relevant coin ------------------------------------------------------------------
const BuyingPopup = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      console.log(searchQuery);
      if (
        searchQuery !== "So11111111111111111111111111111111111111112" &&
        searchQuery.length === 44
      ) {
        const tokenInfo = await getTokenPrice(searchQuery);
        console.log(tokenInfo);
        if (
          tokenInfo.address !== searchQuery ||
          tokenInfo.address === Buying_Address.address
        ) {
          throw new Error("Invalid token address");
        }
        Buying_Address = tokenInfo;
        console.log(tokenInfo);
        onSelect(tokenInfo);
        onClose();
      } else {
        throw new Error("goon");
      }
    } catch (err) {
      console.log(err);
      setError("Error Here");
    }
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <div className={styles.popupHeader}>
          <h3>Enter token to buy</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Enter Contract Address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {error && <p className={styles.errorText}>{error}</p>}
        </div>

        <div className={styles.coinList}>
          <Coins handleclick={onSelect} />
        </div>

        <button className={styles.Select} onClick={handleSubmit}>
          Select
        </button>

        <button className={styles.closeBottomButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

const UIComponent = (props) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(
    props.coins[0] || {
      Symbol: "SOL",
      logo: "https://d23exngyjlavgo.cloudfront.net/solana_So11111111111111111111111111111111111111112",
      USDPrice: 1,
      amount: 0,
      address: "So11111111111111111111111111111111111111112",
    }
  );
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (props.SwapListener) {
      // Use props.SwapListener
      if (props.title === "Buying" && Selling_Address) {
        setSelectedCoin(Selling_Address);
        let temp = Buying_Address;
        Buying_Address = Selling_Address;
        Selling_Address = temp;
        // Reset sellingAmount
      } else if (props.title === "Selling" && Buying_Address) {
        setSelectedCoin(Buying_Address);
        props.setSellingAmount("");
        setAmount("");
      }
      props.setSwap(false);
    }
  }, [props.SwapListener]); // Add props.SwapListener as a dependency

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    if (props.title === "Buying") {
      Buying_Address = coin;
    } else {
      Selling_Address = coin;
    }
    setAmount("");
    setIsPopupOpen(false);
  };

  const calculatePlaceholder = () => {
    if (
      props.title === "Buying" &&
      props.sellingAmount &&
      selectedCoin.USDPrice
    ) {
      return (
        (props.sellingAmount / (selectedCoin.USDPrice || 1)).toFixed(4) || "0"
      );
    }
    return "0";
  };

  return (
    <div
      className={styles.relative + " " + styles.container}
      style={{ marginTop: props.title === "Buying" ? "0" : "10px" }}
    >
      <div className={styles.box}>
        <div className={styles.UIheader}>
          <span className={styles["selling-text"]}>{props.title}</span>
        </div>
      </div>
      <div className={styles.UIMain}>
        <input
          className={styles.MainInput}
          placeholder={calculatePlaceholder()} // Use calculatePlaceholder for dynamic placeholder
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          minLength={1}
          maxLength={79}
          value={amount}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9.]/g, "");
            setAmount(value);

            // Update sellingAmount if this is the "Selling" component
            if (props.title === "Selling") {
              props.setSellingAmount(value * selectedCoin.USDPrice); // Update sellingAmount in parent
              chrome.runtime.sendMessage({ Selling_Amount: value });
              Selling_Amount = Number(value).toFixed(4);
            }
          }}
          readOnly={props.title === "Buying"}
        />
        <button
          className={styles.currency}
          onClick={() => setIsPopupOpen(true)}
        >
          <img
            src={selectedCoin.logo}
            alt={selectedCoin.Symbol}
            className={styles["currency-logo"]}
          />
          <div className={styles["currency-text"]}>{selectedCoin.Symbol}</div>
          <svg fill="none" viewBox="0 0 24 24" width="14px" height="14px">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m5 9 7 7 7-7"
            ></path>
          </svg>
        </button>
      </div>
      <div className={styles.UIFooter}>
        <div className={styles.amount}>
          $
          {props.title === "Selling"
            ? amount
              ? (amount * selectedCoin.USDPrice).toFixed(2)
              : "0.00"
            : props.sellingAmount
            ? props.sellingAmount.toFixed(2)
            : "0.00"}
        </div>
        <div className={styles.buttons}>
          {props.title === "Selling" ? (
            <>
              <button
                className={styles.half}
                onClick={() => {
                  const halfAmount = (selectedCoin.amount / 2).toFixed(4);
                  setAmount(halfAmount);
                  chrome.runtime.sendMessage({ Selling_Amount: halfAmount });
                  props.setSellingAmount(halfAmount * selectedCoin.USDPrice); // Update sellingAmount
                  Selling_Amount = halfAmount;
                }}
              >
                HALF
              </button>
              <button
                className={styles.max}
                onClick={() => {
                  const maxAmount = selectedCoin.amount.toFixed(4);
                  setAmount(maxAmount);
                  chrome.runtime.sendMessage({ Selling_Amount: maxAmount });
                  props.setSellingAmount(maxAmount * selectedCoin.USDPrice); // Update sellingAmount
                  Selling_Amount = maxAmount;
                }}
              >
                MAX
              </button>
            </>
          ) : null}
        </div>
      </div>
      {props.title === "Selling" ? (
        <CurrencyPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          isSelling={true}
          coins={props.coins}
          onSelect={handleCoinSelect}
        />
      ) : (
        <BuyingPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onSelect={handleCoinSelect}
        />
      )}
    </div>
  );
};

function Exchange(props) {
  const navigate = useNavigate();

  async function update() {
    try {
      const updateMessage = await UpdateJSON();
      console.log("Update result:", updateMessage);
    } catch (error) {
      console.error("Error updating JSON:", error);
    }
  }

  async function handleclick() {
    console.log(Selling_Amount, Buying_Address, Selling_Address);
    if (Buying_Address && Selling_Address && Selling_Amount) {
      await exchangeTokens(
        Selling_Address.address,
        Buying_Address.address,
        Selling_Amount,
        Selling_Address.USDPrice,
        Buying_Address.USDPrice,
        0.5
      );
      navigate("/");
    }
  }
  return (
    <div className={styles.Swap_Div}>
      <button className={styles.Swap_Button} onClick={handleclick}>
        Swap
      </button>
    </div>
  );
}
function SwapIcon(props) {
  return (
    <div onClick={() => props.setSwap(true)}>
      <SwapCoin_Icon />
    </div>
  );
}

function Swap() {
  const [coins, setCoins] = useState([]);
  const [sellingAmount, setSellingAmount] = useState(""); // State for Selling_Amount
  const [swap, setSwap] = useState(false); // State for SwapListener

  useEffect(() => {
    async function fetchCoins() {
      const data = await getPortfolio();
      if (data) {
        setCoins(data.coins);
      }
    }
    fetchCoins();
  }, []);

  return (
    <>
      <div className={styles.Main}>
        <Header />
        <div className={styles.SwapTerminal}>
          {/* Pass sellingAmount, setSellingAmount, and SwapListener as props */}
          <UIComponent
            title="Selling"
            coins={coins}
            sellingAmount={sellingAmount}
            setSellingAmount={setSellingAmount}
            setSwap={setSwap}
            SwapListener={swap} // Pass swap state as SwapListener
          />
          <div className={styles["Swap-Icon"]}>
            <SwapIcon setSwap={setSwap} />
          </div>
          <UIComponent
            title="Buying"
            coins={coins}
            sellingAmount={sellingAmount} // Pass sellingAmount to Buying
            setSellingAmount={setSellingAmount} // Ensure setSellingAmount is passed
            SwapListener={swap} // Pass swap state as SwapListener
            setSwap={setSwap}
          />
        </div>
        <Exchange sellingAmount={sellingAmount} />
        <Footer />
      </div>
    </>
  );
}

export default Swap;
