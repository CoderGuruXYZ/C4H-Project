const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const {
    GoogleGenerativeAI
} = require('@google/generative-ai');
const Moralis = require('moralis').default
const fs = require('fs');

dotenv.config();

// Initialize the Express application
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Make the demo_trader files and fonts actually work
app.use('/assets', express.static(path.join(__dirname, 'public', 'demo_trader', 'dist', 'assets'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.woff')) {
            res.setHeader('Content-Type', 'font/woff');
        } else if (path.endsWith('.woff2')) {
            res.setHeader('Content-Type', 'font/woff2');
        }
    }
}));
app.use('/Fonts', express.static(path.join(__dirname, 'public', 'demo_trader', 'dist', 'Fonts'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.woff')) {
            res.setHeader('Content-Type', 'font/woff');
        } else if (path.endsWith('.woff2')) {
            res.setHeader('Content-Type', 'font/woff2');
        }
    }
}));

app.get('/assets/Inter-Regular.woff', (req, res) => {
    res.setHeader('Content-Type', 'font/woff');
    res.sendFile(path.join(__dirname, 'public', 'demo_trader', 'dist', 'assets', 'Inter-Regular.woff'));
});

// Initialize Google Generative AI with the API key
const genAI = new GoogleGenerativeAI("AIzaSyBwbycXy2SsKecug9z79wt7vHhxXu3GZ5Y")

const sessions = {};

// Serve the index.html file for the root route
// This will serve the default page of the application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/demo_trader", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "demo_trader", "dist", "index.html"))
})

// API endpoint to handle chat messages
// This endpoint will be used by the frontend to send messages to the AI
// and receive responses
app.post('/api/chat', async (req, res) => {
    const {
        message,
        userId
    } = req.body;
    if (!userId || !message) {
        return res.status(400).json({
            error: "Missing data"
        });
    }

    try {
        // Check if a session already exists for this user
        // If not, create a new session with the AI model
        if (!sessions[userId]) {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash"
            });

            sessions[userId] = await model.startChat({
                // Set the chat history with a system message to define the AI's role
                history: [{
                        role: "user",
                        parts: [{
                            text: "You are WealthLink's premier financial assistant. Your primary expertise is in financial matters, but you can provide general guidance on adjacent topics when relevant. \n" +
                                "Format all responses in clean Markdown with:\n" +
                                "\n" +
                                "# Headers for main sections\n" +
                                "## Subheaders when needed\n" +
                                "- **Bullet points** for key facts\n" +
                                "- *Italics* for explanations\n" +
                                "\\`\\`\\` \n" +
                                "Code blocks for calculations\n" +
                                "\\`\\`\\`\n" +
                                "| Tables | For | Comparisons |\n" +
                                "|--------|-----|-------------|\n" +
                                "| Data   | Here| When needed |\n" +
                                "**Core Principles:**\n" +
                                "1. **Financial Focus:** Prioritize detailed, accurate financial advice with:\n" +
                                "   - Clear **Markdown formatting**\n" +
                                "   - Structured explanations\n" +
                                "   - Actionable steps\n" +
                                "\n" +
                                "2. **Graceful Boundary Handling:** For non-financial questions:\n" +
                                "   - First identify any financial aspects (\"While I specialize in finance, this might involve...\")\n" +
                                "   - Suggest financial angles (\"For this situation, you might want to consider...\")\n" +
                                "   - Only decline as last resort\n" +
                                "\n" +
                                "3. **Response Format:** Always use:\n" +
                                "   ```markdown\n" +
                                "   # [Relevant Header]\n" +
                                "   - **Key Insight** \n" +
                                "   - *Supporting Detail*\n" +
                                "   `Relevant Calculation` (when applicable)"
                        }] //[{text: "You are a helpful, professional financial assistant for WealthLink. Only answer finance-related questions or follow-up questions. Say 'I cannot help with this, please ask a finance related question.' for unrelated questions. Provide detailed answered formatted properly in Markdown."}], // Give all your answers in plain text, with no indents, lists or formatting.
                    },
                    {
                        role: "model",
                        parts: [{
                            text: "Understood. How can I assist you with financial planning today?"
                        }],
                    }
                ],
            });
        }

        const chat = sessions[userId];

        // Send the user's message to the AI model
        // and get the response
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({
            reply: text
        });
    } catch (err) {
        console.error('Gemini Error:', err.message);
        res.status(500).json({
            error: "Gemini API request failed."
        });
    }
});

// Demo Wallet code -------------------------------------------------------------------------------------------

app.get("/database.json", (req, res) => {
    res.sendFile("database.json", {
        root: __dirname + "/Version1"
    });
});

async function initializeMoralis() {
    try {
        await Moralis.start({
            apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI4NWFkNTY3LWY5MzItNDgxMi04NjQ4LTk3ZGZkZDRlYWEwOCIsIm9yZ0lkIjoiNDMyNDY5IiwidXNlcklkIjoiNDQ0ODU4IiwidHlwZUlkIjoiMzcxYzkwZTMtOGJjOS00NzdiLTg0Y2MtMDUwMGU5NzJmYzY4IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Mzk5ODM4NzUsImV4cCI6NDg5NTc0Mzg3NX0.17BSTPtVkcBPzNAD4TDWXoWdWmrzZTt0zsqcHGd2T9M"
        });
        console.log("Moralis initialized successfully");
    } catch (error) {
        console.error("Failed to initialize Moralis:", error);
        // Exit if Moralis fails to start
    }
}

initializeMoralis()

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

//Function which fetches the token price of an inputted Contract Address
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

// API endpoint to get token price
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

// API endpoint which fetches the current active wallet
app.get("/api/portfolio", async (_, res) => {
    try {
        let data = await fs.promises.readFile(path.join(__dirname, "database.json"), "utf8");
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

// API endpoint which fetches all active wallets
app.get("/api/wallets", async (_, res) => {
    try {
        console.log("here");
        let data = await fs.promises.readFile(path.join(__dirname, "database.json"), "utf8");
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

//Fetches active wallet
app.get("/api/active-wallet", async (_, res) => {
    try {
        console.log("here");
        let data = await fs.promises.readFile(path.join(__dirname, "database.json"), "utf8");
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
        let data = await fs.promises.readFile(path.join(__dirname, "database.json"), "utf8");
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
            path.join(__dirname, "database.json"),
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

// API endpoint to change the active wallet in the database
app.post("/api/change_active", async (req, res) => {
    try {
        const {
            wallet
        } = req.body;
        let data = await fs.promises.readFile(path.join(__dirname, "database.json"), "utf8");
        let jsonData = JSON.parse(data || '{"Wallets": []}');

        if (!jsonData) {
            return res.status(404).json({
                error: "Database not found"
            });
        }

        jsonData.activeWallet = wallet;

        await fs.promises.writeFile(
            path.join(__dirname, "database.json"),
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
        let data = await fs.promises.readFile(path.join(__dirname, "database.json"), "utf8");
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

// API endpoint which exchanges two coins
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
        return res.status(400).json({ error: "Failed to fetch token prices" });


    console.log(selling_res.USDPrice, Selling_Amount)
    console.log(Selling_Amount, Buying_Amount)

    let sellingSlippage = Math.abs(
        (selling_res.USDPrice - Selling_Address.USDPrice) / selling_res.USDPrice
    );
    let buyingSlippage = Math.abs(
        (buying_res.USDPrice - Buying_Address.USDPrice) / buying_res.USDPrice
    );

    if (sellingSlippage > Slippage){
        console.log("Selling Slippage too high: ", sellingSlippage);
        return res
            .status(400)
            .json({ error: "Slippage too high for selling token" });
    }
    if (buyingSlippage > Slippage) {
        console.log("Buying Slippage too high: ", buyingSlippage);
        return res
            .status(400)
            .json({ error: "Slippage too high for buying token" });
    }

    let price = selling_res.USDPrice / buying_res.USDPrice;
    let total = price * amount;

    try {
        console.log("Passed Slippage check, updating portfolio...");
        let data = await fs.promises.readFile("./Version1/database.json", "utf8");
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
                if ((coin.amount).toFixed(4) < Number(amount)) {
                    console.log("Insufficient balance for selling token:", coin.amount, amount);
                    return res.status(400).json({ error: "Insufficient balance" });
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
            return res.status(400).json({ error: "Insufficient balance" });
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
                "./Version1/database.json",
                JSON.stringify(jsonData, null, 2),
                "utf8"
            );
        } catch (error) {
            console.error("Error writing to file:", error);
        }
        res.json({ message: "Exchange successful", updatedPortfolio: jsonData });
    } catch (error) {
        console.error("Error updating portfolio:", error);
        res.status(500).json({ error: "Failed to update portfolio" });
    }
});

// API endpoint which calculates the total balance of the current active wallet
app.get("/api/total-balance", async (req, res) => {
    try {
        let data = await fs.promises.readFile(path.join(__dirname, "database.json"), "utf8");
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

// Calculates the total percentage change of the active wallet
app.get("/api/total-change", async (_, res) => {
    try {
        let data = await fs.promises.readFile(path.join(__dirname, "database.json"), "utf8");
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

// API endpoint to update the JSON file
app.get("/api/UpdateJSON", async (req, res) => {
    try {
        let data = await fs.promises.readFile(path.join(__dirname, "database.json"), "utf-8");
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
            path.join(__dirname, "database.json"),
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

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// To get the response:
// const res = await fetch('/api/chat', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ message })
// });

// Financial advice API endpoint that uses Google's Gemini AI
app.post('/api/financial-advice', async (req, res) => {
    try {
        const {
            userId,
            query,
            financialContext
        } = req.body;

        if (!query) {
            return res.status(400).json({
                error: 'Query is required'
            });
        }

        // Format the financial context for the AI
        const contextString = JSON.stringify(financialContext, null, 2);

        // Create a prompt that includes the user's financial data for context
        // We only need a one-off prompt for this so we can use a simple string template
        // as there is no need for a chat history in this case
        const prompt = `As a financial advisor, I need your advice on the following question:
    
                        "${query}"

                        Here's my current financial situation:
                        ${contextString}

                        Please provide personalized financial advice based on this context. Format your response in HTML paragraphs for readability.`;

        // Get the Gemini AI model - using the existing genAI variable
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        console.log("Sending prompt to Gemini AI:", prompt.substring(0, 100) + "...");

        // Generate a response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const advice = response.text();

        // Log the advice
        console.log('AI Financial Advice Response Received:', advice.substring(0, 100) + "...");

        // Return the advice to the client
        res.json({
            advice
        });
    } catch (error) {
        console.error('Error generating financial advice:', error);
        res.status(500).json({
            error: 'Failed to generate financial advice: ' + error.message
        });
    }
});