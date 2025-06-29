import React, { useEffect } from "react";
import { Header, Footer } from "./App.jsx";
import { getTokenPriceHistory } from "../api.js";
import { useState } from "react";


// Function to fetch transaction history and display it
function Body() {
  let [history, setHistory] = useState([]);

  useEffect(() => {
    async function getHistory() {
      try {
        const historyData = await getTokenPriceHistory();
        if (historyData) {
          setHistory(historyData);
          console.log("Historical Data: ", historyData);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    }
    getHistory();
  }, []);

  return (
    <>
      <div className="App-Body">
        {history
          .slice(0)
          .reverse()
          .map((item, index) => (
            <div key={index} className="Coin-Wrapper">
              <div>
                <div className="soldItem">
                  <div className="Coin-Icon">
                    <img src={item.logo} alt="SOL" />
                  </div>
                  <div className="Coin-Name">
                    <h3 style={{ color: "white" }}>{item.Name}</h3>
                    <p>
                      {item.amount}: {item.Symbol}
                    </p>
                  </div>
                </div>
                <div>{history.buyingAmount}</div>
                <div>{history.sellingAmount}</div>
              </div>
              <div></div>
            </div>
          ))}
      </div>
    </>
  );
}

// Building the main History component
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
