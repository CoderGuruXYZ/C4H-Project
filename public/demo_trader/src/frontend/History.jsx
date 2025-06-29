import React, { useEffect } from "react";
import { Header, Footer } from "./App";
import { getTokenPriceHistory } from "../api";
import { useState } from "react";

// Custom hook to detect dark mode on the body
function useBodyDarkMode() {
  const [isDark, setIsDark] = useState(document.body.classList.contains("dark-mode"));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains("dark-mode"));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

// Renders the main body of the history page
function Body() {
  const isDarkMode = useBodyDarkMode();
  let [history, setHistory] = useState([]);

  useEffect(() => {
    async function getHistory() {
      try {
        const historyData = await getTokenPriceHistory();
        if (historyData) {
          setHistory(historyData);
          console.log("Historical Data: ", historyData)
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    }
    getHistory();
  }, []);

  return (
    <>
  <div
    className="App-Body"
    style={{
      scrollbarWidth: "none",
      flex: "1 1 auto",
      minHeight: 0,
      maxHeight: "560px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      paddingTop: "20px",
    }}
  >
        {history.slice(0).reverse().map((item, index) => (
  <div key={index} className="Coin-Wrapper">
    <div className="soldItem" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {/* Selling Token */}
      <div className="Coin-Icon">
        <img src={item.sellingToken.logo} alt={item.sellingToken.Symbol} style={{ width: 32, height: 32, borderRadius: "50%" }} />
      </div>
      <div className="Coin-Name">
        <h3 style={isDarkMode ? { color: "white", margin: 0 } : { color: "black", margin: 0}}>{item.sellingToken.Name}</h3>
        <p style={{ margin: 0 }}>
          -{item.amount} {item.sellingToken.Symbol}
        </p>
        <p style={{ margin: 0, fontSize: "0.9em", color: "#aaa" }}>
          (${(item.amount * item.sellingToken.USDPrice).toFixed(2)})
        </p>
      </div>
      <span style={{ fontWeight: "bold", fontSize: "1.2em", color: "#3a5ca8" }}>→</span>
      {/* Buying Token */}
      <div className="Coin-Icon">
        {item.buyingToken.logo ? (
          <img src={item.buyingToken.logo} alt={item.buyingToken.Symbol} style={{ width: 32, height: 32, borderRadius: "50%" }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {item.buyingToken.Symbol[0]}
          </div>
        )}
      </div>
      <div className="Coin-Name">
        <h3 style={isDarkMode ? { color: "white", margin: 0 } : { color: "black", margin: 0}}>{item.buyingToken && item.buyingToken.Name ? item.buyingToken.Name : "N/A"}</h3>
        <p style={{ margin: 0 }}>
          +{item.buyingToken && typeof item.buyingToken.amount === "number" ? item.buyingToken.amount.toFixed(2) : "0.00"} {item.buyingToken && item.buyingToken.Symbol ? item.buyingToken.Symbol : ""}
        </p>
        <p style={{ margin: 0, fontSize: "0.9em", color: "#aaa" }}>
          (${item.buyingToken && typeof item.buyingToken.amount === "number" && typeof item.buyingToken.USDPrice === "number" ? (item.buyingToken.amount * item.buyingToken.USDPrice).toFixed(2) : "0.00"})
        </p>
      </div>
    </div>
  </div>
))}
      </div>
    </>
  );
}

// Renders the full history page with header, body, and footer
function History() {
  return (
    <div className="Main">
      <div>
        <Header />
        <Body />
        <Footer />
      </div>
    </div>
  );
}

export default History;
