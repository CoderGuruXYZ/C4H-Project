import express from "express";
import Moralis from "moralis";
import dotenv from "dotenv";
import fs from "fs";
import cors from "cors";


// Initialises connection to external api
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const apikey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI4NWFkNTY3LWY5MzItNDgxMi04NjQ4LTk3ZGZkZDRlYWEwOCIsIm9yZ0lkIjoiNDMyNDY5IiwidXNlcklkIjoiNDQ0ODU4IiwidHlwZUlkIjoiMzcxYzkwZTMtOGJjOS00NzdiLTg0Y2MtMDUwMGU5NzJmYzY4IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Mzk5ODM4NzUsImV4cCI6NDg5NTc0Mzg3NX0.17BSTPtVkcBPzNAD4TDWXoWdWmrzZTt0zsqcHGd2T9M";

app.use(express.json());
app.use(cors());

app.get("/database.json", (req, res) => {
  res.sendFile("database.json", {
    root: "./src"
  });
});

async function initializeMoralis() {
  await Moralis.start({
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI4NWFkNTY3LWY5MzItNDgxMi04NjQ4LTk3ZGZkZDRlYWEwOCIsIm9yZ0lkIjoiNDMyNDY5IiwidXNlcklkIjoiNDQ0ODU4IiwidHlwZUlkIjoiMzcxYzkwZTMtOGJjOS00NzdiLTg0Y2MtMDUwMGU5NzJmYzY4IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Mzk5ODM4NzUsImV4cCI6NDg5NTc0Mzg3NX0.17BSTPtVkcBPzNAD4TDWXoWdWmrzZTt0zsqcHGd2T9M",
  });
}

//Local API function which initiallises connection to external api
app.get("/api/initialize-moralis", async (req, res) => {
  try {
    await initializeMoralis();
    res.json({
      message: "Moralis initialized"
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to initialize Moralis"
    });
  }
});

//Function which fetches the token price of an inputted Contract Address-------------------------------------------
async function getTokenPrice(address) {
  try {
    const response = await Moralis.SolApi.token.getTokenPrice({
      network: "mainnet",
      address: address,
    });

    return {
      USDPrice: response.raw.usdPrice,
      Name: response.raw.name,
      Symbol: response.raw.symbol,
      logo: response.raw.logo,
      address: address,
      PricePercentChange: response.raw.usdPrice24hrPercentChange,
      PriceChange: response.raw.usdPrice24hrUsdChange,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

// API endpoint to get token price ----------------------------------------------------------------------------------------------------------
app.get("/api/token-price/:address", async (req, res) => {
  const {
    address
  } = req.params;
  const data = await getTokenPrice(address);
  if (!data)
    return res.status(400).json({
      error: "Failed to fetch token price"
    });
  res.json(data);
});

// API endpoint which fetches the current active wallet ------------------------------------------------------------------
app.get("/api/portfolio", async (_, res) => {
  try {
    let data = await fs.promises.readFile("./src/database.json", "utf8");
    let jsonData = JSON.parse(data || '{"Wallets": []}');

    let activeWallet = jsonData.activeWallet;
    const wallet = jsonData.Wallets.find(
      (w) => w["Wallet-Name"] === activeWallet
    );
    if (!wallet) {
      return res.status(404).json({
        error: "Active wallet not found"
      });
    }

    res.json(wallet);
  } catch (error) {
    console.error("Error reading portfolio:", error);
    res.status(500).json({
      error: "Failed to read portfolio"
    });
  }
});

// API endpoint which fetches all active wallets ------------------------------------------------------------------------------------------------------------------------------------
app.get("/api/wallets", async (_, res) => {
  try {
    console.log("here");
    let data = await fs.promises.readFile("./src/database.json", "utf8");
    let jsonData = JSON.parse(data || '{"Wallets": []}');

    const wallets = jsonData.Wallets;

    console.log("active wallets: ", wallets);
    if (!wallets) {
      return res.status(404).json({
        error: "Active wallet not found"
      });
    }

    res.json(wallets);
  } catch (error) {
    console.error("Error reading portfolio:", error);
    res.status(500).json({
      error: "Failed to read portfolio"
    });
  }
});


//Fetches active wallet ------------------------------------------------------------------------------------------------------------------------------------
app.get("/api/active-wallet", async (_, res) => {
  try {
    console.log("here");
    let data = await fs.promises.readFile("./src/database.json", "utf8");
    let jsonData = JSON.parse(data || '{"Wallets": []}');

    if (!jsonData) {
      return res.status(404).json({
        error: "Database not found"
      });
    }
    if (
      jsonData.Wallets.find(
        (w) => w["Wallet-Name"] === jsonData.activeWallet
      ) === undefined
    ) {
      jsonData.activeWallet = jsonData.Wallets[0]["Wallet-Name"];
    }
    res.json(jsonData.activeWallet);
  } catch (error) {
    console.error("Error reading portfolio:", error);
    res.status(500).json({
      error: "Failed to read portfolio"
    });
  }
});

// Function to add a wallet to the database
app.post("/api/add_wallet", async (req, res) => {
  try {
    let data = await fs.promises.readFile("./src/database.json", "utf8");
    let jsonData = JSON.parse(data || '{"Wallets": []}');
    if (!jsonData) {
      return res.status(404).json({
        error: "Database not found"
      });
    }

    if ((jsonData.Wallets).length >= 10) {
      return res.status(400).json({
        error: "Max wallets reached"
      });
    }
    console.log(req.body);

    const {
      walletName
    } = req.body;

    let tokenPrice = await getTokenPrice(
      "So11111111111111111111111111111111111111112"
    );
    if (!tokenPrice) {
      return res.status(400).json({
        error: "Failed to fetch Solana price."
      });
    }

    tokenPrice.amount = 1;

    jsonData.Wallets.push({
      "Wallet-Name": walletName,
      coins: [tokenPrice],
      History: [],
    });

    await fs.promises.writeFile(
      "./src/database.json",
      JSON.stringify(jsonData, null, 2),
      "utf8"
    );
    res.json({
      message: "Wallet added successfully",
      walletName
    });
  } catch (error) {
    console.error("Error adding wallet:", error);
    res.status(500).json({
      error: "Failed to add wallet"
    });
  }
});

// API endpoint to change the active wallet in the database ------------------------------------------------------------------------------------------------------------------------------------
app.post("/api/change_active", async (req, res) => {
  try {
    const {
      wallet
    } = req.body;
    let data = await fs.promises.readFile("./src/database.json", "utf8");
    let jsonData = JSON.parse(data || '{"Wallets": []}');

    if (!jsonData) {
      return res.status(404).json({
        error: "Database not found"
      });
    }

    jsonData.activeWallet = wallet;

    await fs.promises.writeFile(
      "./src/database.json",
      JSON.stringify(jsonData, null, 2),
      "utf8"
    );
    res.json({
      message: "Active wallet updated successfully",
      activeWallet: jsonData.activeWallet,
    });
  } catch (error) {
    console.error("Error updating active wallet:", error);
    res.status(500).json({
      error: "Failed to update active wallet"
    });
  }
});

app.get("/api/getHistory", async (_, res) => {
  try {
    let data = await fs.promises.readFile("./src/database.json", "utf8");
    let jsonData = JSON.parse(data || '{"Wallets": []}');

    let activeWallet = jsonData.activeWallet;
    const wallet = jsonData.Wallets.find(
      (w) => w["Wallet-Name"] === activeWallet
    );
    if (!wallet) {
      return res.status(404).json({
        error: "Active wallet not found"
      });
    }

    res.json(wallet.History);
  } catch (error) {
    console.error("Error reading portfolio:", error);
    res.status(500).json({
      error: "Failed to read portfolio"
    });
  }
})

// API endpoint which exchanges two coins ------------------------------------------------------------------------------------------------------------------------------------
app.post("/api/exchange", async (req, res) => {
  console.log("Body:", req.body); // Log the entire body

  const {
    Selling_Address,
    Buying_Address,
    amount,
    Selling_Amount,
    Buying_Amount,
    Slippage,
  } = req.body;

  console.log(Number(amount))
  let selling_res = await getTokenPrice(Selling_Address);
  let buying_res = await getTokenPrice(Buying_Address);

  if (!selling_res || !buying_res)
    return res.status(400).json({
      error: "Failed to fetch token prices"
    });

  let sellingSlippage = Math.abs(
    (selling_res.USDPrice - Selling_Amount) / selling_res.USDPrice
  );
  let buyingSlippage = Math.abs(
    (buying_res.USDPrice - Buying_Amount) / buying_res.USDPrice
  );

  if (sellingSlippage > Slippage)
    return res
      .status(400)
      .json({
        error: "Slippage too high for selling token"
      });
  if (buyingSlippage > Slippage)
    return res
      .status(400)
      .json({
        error: "Slippage too high for buying token"
      });

  let price = selling_res.USDPrice / buying_res.USDPrice;
  let total = price * amount;

  try {
    console.log("Passed Slippage check, updating portfolio...");
    let data = await fs.promises.readFile("./src/database.json", "utf8");
    let jsonData = JSON.parse(data || '{"Wallets": []}');

    let activeWallet = jsonData.activeWallet;
    let wallet = jsonData.Wallets.find(
      (w) => w["Wallet-Name"] === activeWallet
    );
    let coins = wallet.coins;

    // Reduce balance of sold token
    let sufficientBalance = false;
    for (let coin of coins) {
      if (coin.address === selling_res.address) {
        if ((coin.amount).toFixed(4) < amount) {
          console.log("Insufficient balance for selling token:", coin.amount, amount);
          return res.status(400).json({
            error: "Insufficient balance"
          });
        }
        coin.amount -= amount;
        if (coin.amount < 0.0001) {
          coins = coins.filter((c) => c.address !== coin.address);
        }
        sufficientBalance = true;
        break;
      }
    }

    if (!sufficientBalance) {
      return res.status(400).json({
        error: "Insufficient balance"
      });
    }

    console.log("Passed balance check, updating portfolio...");
    // Add or update the new token
    let existingCoin = coins.find(
      (coin) =>
      coin.Symbol === buying_res.Symbol || coin.address === Buying_Address
    );

    if (existingCoin) {
      existingCoin.amount += total;
    } else {
      buying_res.amount = total;
      coins.push(buying_res);
    }

    let index = jsonData.Wallets.findIndex(
      (w) => w["Wallet-Name"] === activeWallet
    );

    // Update history
    let history = jsonData.Wallets[index].History;
    let historyEntry = {
      sellingToken: selling_res,
      sellingAmount: Selling_Amount,
      buyingAmount: Buying_Amount,
      buyingToken: buying_res,
      amount: amount,
      total: total,
    };
    history.shift();
    history.push(historyEntry);

    jsonData.Wallets[index].coins = coins;
    console.log(jsonData.Wallets[index])
    try {
      await fs.promises.writeFile(
        "./src/database.json",
        JSON.stringify(jsonData, null, 2),
        "utf8"
      );
    } catch (error) {
      console.error("Error writing to file:", error);
    }
    res.json({
      message: "Exchange successful",
      updatedPortfolio: jsonData
    });
  } catch (error) {
    console.error("Error updating portfolio:", error);
    res.status(500).json({
      error: "Failed to update portfolio"
    });
  }
});

// API endpoint which calculates the total balance of the current active wallet ------------------------------------------------------------------
app.get("/api/total-balance", async (req, res) => {
  try {
    let data = await fs.promises.readFile("./src/database.json", "utf8");
    let jsonData = JSON.parse(data || '{"Wallets": []}');

    let activeWallet = jsonData.activeWallet;
    let wallet = jsonData.Wallets.find(
      (w) => w["Wallet-Name"] === activeWallet
    );
    let coins = wallet.coins;

    let total = coins.reduce((sum, coin) => {
      const amount = Number(coin.amount) || 0;
      const price = Number(coin.USDPrice) || 0;
      return sum + amount * price;
    }, 0);

    res.json({
      total
    });
  } catch (error) {
    console.error("Error calculating total balance:", error);
    res
      .status(500)
      .json({
        error: "Failed to calculate total balance",
        details: error.message,
      });
  }
});

// Calculates the total percentage change of the active wallet ------------------------------------------------------------------------------------------------------------------------------------
app.get("/api/total-change", async (_, res) => {
  try {
    let data = await fs.promises.readFile("./src/database.json", "utf8");
    let jsonData = JSON.parse(data || '{"Wallets": []}');
    let activeWallet = jsonData.activeWallet;
    let wallet = jsonData.Wallets.find(
      (w) => w["Wallet-Name"] === activeWallet
    );

    if (!wallet) {
      return res.status(404).json({
        error: "Active wallet not found"
      });
    }

    let coins = wallet.coins;

    let total = coins.reduce((sum, coin) => {
      const amount = Number(coin.amount) || 0;
      const pricechange = Number(coin.PriceChange) || 0;
      return sum + amount * pricechange;
    }, 0);
    res.json({
      total
    });
  } catch (error) {
    console.error("Error calculating total change:", error);
    res
      .status(500)
      .json({
        error: "Failed to calculate total change",
        details: error.message,
      });
  }
});

// API endpoint to update the JSON file ------------------------------------------------------------------------------------------------------------------------------------
app.get("/api/UpdateJSON", async (req, res) => {
  try {
    let data = await fs.promises.readFile("./src/database.json", "utf-8");
    let jsonData = JSON.parse(data || '{"Wallets": []}');
    let activeWallet = jsonData.activeWallet;
    let wallet = jsonData.Wallets.find(
      (w) => w["Wallet-Name"] === activeWallet
    );
    let coins = wallet.coins;

    for (let coin of coins) {
      let priceData = await getTokenPrice(coin.address);
      if (priceData) {
        coin.USDPrice = priceData.USDPrice;
        coin.PricePercentChange = priceData.PricePercentChange;
        coin.PriceChange = priceData.PriceChange;
      }
    }

    coins.sort((a, b) => b.amount * b.USDPrice - a.amount * a.USDPrice);

    let index = jsonData.Wallets.findIndex(
      (w) => w["Wallet-Name"] === activeWallet
    );
    jsonData.Wallets[index].coins = coins;

    await fs.promises.writeFile(
      "./src/database.json",
      JSON.stringify(jsonData, null, 2),
      "utf8"
    );
    res.json({
      message: "JSON file updated successfully."
    });
  } catch (error) {
    console.error("Error updating prices:", error);
    res.status(500).json({
      error: "Failed to update JSON"
    });
  }
});

// Start server ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);