const { GoogleGenerativeAI } = require("@google/generative-ai");
const Invoice = require("../models/Invoice");
const Purchase = require("../models/Purchase");
const Expense = require("../models/Expense");
const Product = require("../models/Product");

exports.chatWithAi = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ reply: "Please set the GEMINI_API_KEY in your .env file to use the AI chat." });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "No message provided" });
    }

    // Fetch basic context data for the user
    const invoices = await Invoice.find({ user: req.user._id });
    const purchases = await Purchase.find({ user: req.user._id });
    const expenses = await Expense.find({ user: req.user._id });
    const products = await Product.find({ user: req.user._id });

    // Summarize data
    const totalSales = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalProfit = totalSales - totalPurchases - totalExpenses;
    
    const productList = products.map(p => `${p.name} (Stock: ${p.quantity}, Price: ${p.price})`).join(", ");

    const systemPrompt = `You are an expert AI Virtual Manager for a business using the 'Profitex' Billing & Inventory system.
Here is the current summary of the business data:
- Total Sales: ₹${totalSales}
- Total Purchases (Inventory Cost): ₹${totalPurchases}
- Total Expenses: ₹${totalExpenses}
- Net Profit: ₹${totalProfit}
- Current Products & Stock: ${productList}

The business owner asks you: "${message}"

Respond naturally, concisely, and professionally. Use the data provided above to answer their question. If the answer is not in the data, explain what you can see. Do not use formatting like markdown bolding if it's not necessary, keep it clean.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ reply: "I encountered an error trying to think. Please try again." });
  }
};

exports.scanReceipt = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ message: "GEMINI_API_KEY not configured." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    // Build the prompt for structured data
    const prompt = `Analyze this receipt/invoice image. Extract the following information and return it ONLY as a valid JSON object. Do not include markdown code blocks or any other text.
Keys required:
- "vendorName": The name of the store or company (string)
- "amount": The total amount billed (number)
- "date": The date of the bill in YYYY-MM-DD format (string, if not found use today's date)
- "description": A short summary of what was bought (string, max 3-4 words)

Example Output:
{"vendorName": "Amazon", "amount": 1200, "date": "2023-10-15", "description": "Office Supplies"}
`;

    // Convert multer file buffer to AI format
    const imageParts = [
      {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    let text = response.text().trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    const parsedData = JSON.parse(text);

    res.json(parsedData);
  } catch (error) {
    console.error("Receipt Scan Error:", error);
    res.status(500).json({ message: "Failed to scan receipt: " + error.message });
  }
};

exports.predictDemand = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ message: "GEMINI_API_KEY not configured." });
    }

    const products = await Product.find({ user: req.user._id });
    const invoices = await Invoice.find({ user: req.user._id });

    // Calculate sales velocity
    const salesVolume = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        salesVolume[item.productName] = (salesVolume[item.productName] || 0) + item.quantity;
      });
    });

    const inventoryData = products.map(p => ({
      name: p.name,
      currentStock: p.quantity,
      totalSold: salesVolume[p.name] || 0
    }));

    const prompt = `Analyze this inventory data. Identify 3 products that are most at risk of going out of stock soon based on their 'totalSold' vs 'currentStock'.
Return ONLY a valid JSON array of objects. Each object should have:
- "productName": string
- "reason": string (short reason like "High sales volume, only 5 left")
- "recommendedOrder": number (suggested quantity to buy)

Inventory Data:
${JSON.stringify(inventoryData)}

Example Output:
[{"productName": "Laptop", "reason": "High sales, only 2 left", "recommendedOrder": 15}]`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const result = await model.generateContent(prompt);
    
    let text = (await result.response).text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    const parsedData = JSON.parse(text);
    res.json(parsedData);

  } catch (error) {
    console.error("Demand Predict Error:", error);
    res.status(500).json({ message: "Failed to predict demand: " + error.message });
  }
};

exports.draftEmail = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ message: "GEMINI_API_KEY not configured." });
    }

    const { clientName, invoiceNumber, grandTotal, date } = req.body;

    const prompt = `Write a polite, professional email to a client named ${clientName} attaching their recent invoice (Invoice #${invoiceNumber}) for the amount of ₹${grandTotal} generated on ${new Date(date).toLocaleDateString()}.
Make the email concise, friendly, and ask them to let us know if they have any questions. Do not include markdown formatting or placeholder brackets like [Your Name] if possible, just write the generic sign-off.
Format the output as a JSON object:
{ "subject": "Email subject here", "body": "Email body here" }`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const result = await model.generateContent(prompt);
    
    let text = (await result.response).text().trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    const parsedData = JSON.parse(text);
    res.json(parsedData);

  } catch (error) {
    console.error("Draft Email Error:", error);
    res.status(500).json({ message: "Failed to generate email: " + error.message });
  }
};
