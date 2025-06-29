import React from "react";
import { Header,Footer } from "./App.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Swap.module.css"; 
import { SwapCoin_Icon } from "./icons.jsx";
import { getPortfolio, getTokenPrice, exchangeTokens,UpdateJSON } from "../api.js";

// Renders a single coin in the swap UI
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

// Renders the list of coins for selection
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
    (coin) => coin.address !== props.buyingAddress?.address && coin.address !== props.sellingAddress?.address
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
              props.setSellingAddress(coin);
              chrome.runtime.sendMessage({ Selling_Address: coin });
            } else {
              props.setBuyingAddress(coin);
              chrome.runtime.sendMessage({ Buying_Address: coin });
            }
          }}
        />
      ))}
    </div>
  );
}

// Renders the popup for selecting a currency to sell
const CurrencyPopup = ({ isOpen, onClose, isSelling, coins, onSelect, buyingAddress, sellingAddress, setBuyingAddress, setSellingAddress }) => {
  const [searchQuery, setSearchQuery] = useState("");
  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <div className={styles.popupHeader}>
          <h3>{isSelling ? "Select token to sell" : "Enter token to buy"}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
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
          <Coins handleclick={onSelect} buyingAddress={buyingAddress} sellingAddress={sellingAddress} setBuyingAddress={setBuyingAddress} setSellingAddress={setSellingAddress} isSelling={isSelling} />
        </div>

        <button className={styles.closeBottomButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

// Renders the popup for entering a token to buy
const BuyingPopup = ({ isOpen, onClose, onSelect, buyingAddress, setBuyingAddress }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      console.log(searchQuery);
      const tokenInfo = await getTokenPrice(searchQuery);
      console.log(tokenInfo);
      if (tokenInfo.address !== searchQuery || (buyingAddress && tokenInfo.address === buyingAddress.address)) {
        throw new Error("Invalid token address");
      }
      setBuyingAddress(tokenInfo);
      onSelect(tokenInfo);
      onClose();
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
          <button className={styles.closeButton} onClick={onClose}>×</button>
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
          <Coins handleclick={onSelect} buyingAddress={buyingAddress} />
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

// Renders the main UI component for buying/selling tokens
const UIComponent = (props) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(
    props.coins[0] || {
      Symbol: 'SOL',
      logo: "https://d23exngyjlavgo.cloudfront.net/solana_So11111111111111111111111111111111111111112",
      USDPrice: 1,
      amount: 0,
      address: "So11111111111111111111111111111111111111112",
    }
  );
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (props.title === "Buying" && props.buyingAddress) {
      setSelectedCoin(props.buyingAddress);
    }
    if (props.title === "Selling" && props.sellingAddress) {
      setSelectedCoin(props.sellingAddress);
    }
  }, [props.title, props.buyingAddress, props.sellingAddress]);

  useEffect(() => {
    if (props.SwapListener) {
      if (props.title === "Buying" && props.sellingAddress) {
        setSelectedCoin(props.sellingAddress);
        let temp = props.buyingAddress;
        props.setBuyingAddress(props.sellingAddress);
        props.setSellingAddress(temp);
      } else if(props.title === "Selling" && props.buyingAddress) {
        setSelectedCoin(props.buyingAddress);
        props.setSellingAmount("");
        setAmount("");
        props.setTokenAmount("");
      }
      props.setSwap(false); 
    }
  }, [props.SwapListener]);

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    if (props.title === "Buying") {
      props.setBuyingAddress(coin);
    } else {
      props.setSellingAddress(coin);
    }
    setAmount("");
    if (props.title === "Selling") props.setTokenAmount("");
    setIsPopupOpen(false);
  };

  const calculatePlaceholder = () => {
    if (props.title === "Buying" && props.sellingAmount && selectedCoin.USDPrice) {
      return (
        (props.sellingAmount / (selectedCoin.USDPrice || 1)).toFixed(4) || "0"
      );
    }
    return "0";
  };

  return (
    <div
      className={styles.relative + " " + styles.container}
      style={{ marginTop: props.title === "Buying" ? "0" : "60px" }}
    >
      <div className={styles.box}>
        <div className={styles.UIheader}>
          <span className={styles["selling-text"]}>{props.title}</span>
        </div>
      </div>
      <div className={styles.UIMain}>
        <input
          className={styles.MainInput}
          placeholder={calculatePlaceholder()}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          minLength={1}
          maxLength={79}
          value={props.title === "Buying" ? calculatePlaceholder() : amount}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9.]/g, "");
            setAmount(value);
            if (props.title === "Selling") {
              props.setSellingAmount(value * selectedCoin.USDPrice);
              props.setTokenAmount(value);
              chrome.runtime.sendMessage({ Selling_Amount: value });
            }
          }}
          readOnly={props.title === "Buying"}
        />
        <button className={styles.currency} onClick={() => setIsPopupOpen(true)}>
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
          ${(props.title === "Selling" ? (amount ? (amount * selectedCoin.USDPrice).toFixed(2) : "0.00") : (props.sellingAmount ? props.sellingAmount.toFixed(2) : "0.00"))}
        </div>
        <div className={styles.buttons}>
          {props.title === "Selling" ? (
            <>
              <button
                className={styles.half}
                onClick={() => {
                  const halfAmount = (selectedCoin.amount / 2).toFixed(4);
                  setAmount(halfAmount);
                  props.setSellingAmount(halfAmount * selectedCoin.USDPrice);
                  props.setTokenAmount(halfAmount);
                  chrome.runtime.sendMessage({ Selling_Amount: halfAmount });
                }}
              >
                HALF
              </button>
              <button
                className={styles.max}
                onClick={() => {
                  const maxAmount = selectedCoin.amount.toFixed(4);
                  setAmount(maxAmount);
                  props.setSellingAmount(maxAmount * selectedCoin.USDPrice);
                  props.setTokenAmount(maxAmount);
                  chrome.runtime.sendMessage({ Selling_Amount: maxAmount });
                }}
              >
                MAX
              </button>
            </>
          ) : null}
        </div>
      </div>
      {/* Add padding to the USD price in the buying coin display */}
      {props.title === "Buying" && (
        <div style={{ paddingBottom: "10px" }}></div>
      )}
      {props.title === "Selling" ? (
        <CurrencyPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          isSelling={true}
          coins={props.coins}
          onSelect={handleCoinSelect}
          buyingAddress={props.buyingAddress}
          sellingAddress={props.sellingAddress}
          setBuyingAddress={props.setBuyingAddress}
          setSellingAddress={props.setSellingAddress}
        />
      ) : (
        <BuyingPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onSelect={handleCoinSelect}
          buyingAddress={props.buyingAddress}
          setBuyingAddress={props.setBuyingAddress}
        />
      )}
    </div>
  );
};

// Handles the token exchange logic and swap button
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
    if (props.buyingAddress && props.sellingAddress && props.tokenAmount) {
      const amount = Number(props.tokenAmount);
      const Selling_Amount = amount * props.sellingAddress.USDPrice;
      const Buying_Amount = Selling_Amount / props.buyingAddress.USDPrice;
      await exchangeTokens(
        props.sellingAddress.address,
        props.buyingAddress.address,
        amount,
        Selling_Amount,
        Buying_Amount,
        0.5
      );
      navigate("/index.html");
    }
  }
  return (
    <div className={styles.Swap_Div}>
      <button className={styles.Swap_Button} onClick={handleclick}>Swap</button>
    </div>
  );
}

// Renders the swap icon button
function SwapIcon(props) {
  return (
    <div onClick={() => props.setSwap(true)}>
      <SwapCoin_Icon />
    </div>
  );
}

// Main Swap component, manages swap state and layout
function Swap() {
  const [coins, setCoins] = useState([]);
  const [sellingAmount, setSellingAmount] = useState(""); // USD value
  const [tokenAmount, setTokenAmount] = useState(""); // actual token amount
  const [swap, setSwap] = useState(false);
  const [buyingAddress, setBuyingAddress] = useState(null);
  const [sellingAddress, setSellingAddress] = useState(null);

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
          <UIComponent
            title="Selling"
            coins={coins}
            sellingAmount={sellingAmount}
            setSellingAmount={setSellingAmount}
            setTokenAmount={setTokenAmount}
            tokenAmount={tokenAmount}
            setSwap={setSwap}
            SwapListener={swap}
            buyingAddress={buyingAddress}
            sellingAddress={sellingAddress}
            setBuyingAddress={setBuyingAddress}
            setSellingAddress={setSellingAddress}
          />
          <UIComponent
            title="Buying"
            coins={coins}
            sellingAmount={sellingAmount}
            setSellingAmount={setSellingAmount}
            setTokenAmount={setTokenAmount}
            tokenAmount={tokenAmount}
            SwapListener={swap}
            setSwap={setSwap}
            buyingAddress={buyingAddress}
            sellingAddress={sellingAddress}
            setBuyingAddress={setBuyingAddress}
            setSellingAddress={setSellingAddress}
          />
        </div>
        <Exchange
          sellingAmount={sellingAmount}
          buyingAddress={buyingAddress}
          sellingAddress={sellingAddress}
          tokenAmount={tokenAmount}
        />
        <Footer />
      </div>
    </>
  );
}

export default Swap;