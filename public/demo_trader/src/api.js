// All functions which call the API

const baseUrl = 'http://localhost:5000'; // Use your server's base URL

// Function to get token price
export async function getTokenPrice(address) {
  try {
    const res = await fetch(`${baseUrl}/api/token-price/${address}`);
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching token price:", error);
    return null;
  }
}

// Function to get portfolio
export async function getPortfolio() {
  try {
    const res = await fetch(`${baseUrl}/api/portfolio`);
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return null;
  }
}

export async function getWallets() {
  try {
    const res = await fetch(`${baseUrl}/api/wallets`);
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return null;
  }
}

export async function getActiveWallet() {
  try {
    const res = await fetch(`${baseUrl}/api/active-wallet`);
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return null;
  }
}

export async function changeActiveWallet(wallet) {
  try {
    const res = await fetch(`${baseUrl}/api/change_active`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet
      }),
    });

    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error changing active wallet:", error);
    return null;
  }
}

// Function to update portfolio (exchange tokens)
export async function exchangeTokens(Selling_Address, Buying_Address, amount, Selling_Amount, Buying_Amount, Slippage) {
  try {
    const res = await fetch(`${baseUrl}/api/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Selling_Address,
        Buying_Address,
        amount,
        Selling_Amount,
        Buying_Amount,
        Slippage
      }),
    });
    console.log(Selling_Address, Buying_Address, amount, Selling_Amount, Buying_Amount, Slippage)
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error exchanging tokens:", error);
    return null;
  }
}

export async function getTokenPriceHistory() {
  try {
    const res = await fetch(`${baseUrl}/api/getHistory`);
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    console.log("Raw token price history data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching token price history:", error);
    return null;
  }
}

export async function getTotalBalance() {
  try {
    const res = await fetch(`${baseUrl}/api/total-balance`);
    console.log("Total balance response status:", res.status);

    if (!res.ok) {
      throw new Error(`Network response was not ok: ${res.status}`);
    }

    const data = await res.json();
    console.log("Raw total balance data:", data);

    if (typeof data.total !== 'number') {
      console.error("Invalid total balance received:", data.total);
      return 0;
    }

    return data.total;
  } catch (error) {
    console.error("Error fetching total balance:", error);
    return 0;
  }
}

export async function getTotalChange() {
  try {
    const res = await fetch(`${baseUrl}/api/total-change`);
    console.log("Total change response status:", res.status);

    if (!res.ok) {
      throw new Error(`Network response was not ok: ${res.status}`);
    }

    const data = await res.json();
    console.log("Raw total balance data:", data);

    if (typeof data.total !== 'number') {
      console.error("Invalid total balance received:", data.total);
      return 0;
    }

    return data.total;
  } catch (error) {
    console.error("Error fetching total balance:", error);
    return 0;
  }
}

// Function to initialize Moralis
export async function initializeMoralis() {
  try {
    const res = await fetch(`${baseUrl}/api/initialize-moralis`);
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    console.log("Fetched total balance:", data.message)
    return data.message;
  } catch (error) {
    console.error("Error initializing Moralis:", error);
    return null;
  }
}

export async function UpdateJSON() {
  try {
    const res = await fetch(`${baseUrl}/api/UpdateJSON`);
    if (!res.ok) {
      throw new Error("Error updating JSON");
    }
    const data = await res.json();
    console.log("Updated JSON:", data.message)
    return data.message
  } catch (error) {
    console.log("Error updating JSON")
    return null
  }
}

export async function addWallet(walletName) {
  try {
    console.log("here")
    const res = await fetch(`${baseUrl}/api/add_wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletName
      }),
    });
    if (!res.ok) {
      throw new Error("Error updating JSON");
    }
    const data = await res.json();
    console.log("Updated JSON:", data.message)
    changeActiveWallet(walletName)
    return data.message
  } catch (error) {
    console.log("Error updating JSON")
    return null
  }
}