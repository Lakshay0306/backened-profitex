const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const Company = require("../models/Company");
const PDFDocument = require("pdfkit");

/* ========================
   CREATE INVOICE
======================== */

exports.createInvoice = async (req, res) => {
  try {

    const { customerName, customerPhone, customerEmail, items } = req.body;

    let subtotal = 0;
    let gstTotal = 0;
    let invoiceItems = [];

    for (let item of items) {

      const product = await Product.findOne({
        _id: item.productId,
        user: req.user._id
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      const base = product.price * item.quantity;
      const gst = (base * product.gst) / 100;

      subtotal += base;
      gstTotal += gst;

      product.quantity -= item.quantity;
      await product.save();

      invoiceItems.push({
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        gst: product.gst,
        total: base + gst
      });
    }

    const grandTotal = subtotal + gstTotal;

    const invoice = await Invoice.create({
      user: req.user._id,
      invoiceNumber: "INV-" + Date.now(),
      customerName,
      customerPhone,
      customerEmail,
      items: invoiceItems,
      subtotal,
      gstTotal,
      grandTotal
    });

    res.json(invoice);

  } catch (error) {
    res.status(500).json({ message: "Invoice creation failed" });
  }
};

/* ========================
   GET INVOICES
======================== */

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

/* ========================
   DOWNLOAD PDF
======================== */

exports.downloadInvoice = async (req, res) => {

  try {

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const company = await Company.findOne({ user: invoice.user });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    /* ===== COMPANY HEADER ===== */

    doc.fontSize(22).text(company?.name || "PROFITEX");

    if (company?.logo) {
      doc.image(`uploads/${company.logo}`, 450, 40, { width: 80 });
    }

    doc
      .fontSize(12)
      .text(`GST: ${company?.gstNumber || "-"}`)
      .text(company?.address || "")
      .moveDown();

    doc.text(`Invoice No: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.text(`Customer: ${invoice.customerName}`);
    if (invoice.customerPhone) doc.text(`Phone: ${invoice.customerPhone}`);
    if (invoice.customerEmail) doc.text(`Email: ${invoice.customerEmail}`);
    doc.moveDown(2);

    /* ===== TABLE HEADER ===== */

    const tableTop = doc.y;

    doc.fontSize(12);
    doc.text("Item", 50, tableTop);
    doc.text("Qty", 300, tableTop);
    doc.text("Price", 350, tableTop);
    doc.text("GST%", 420, tableTop);
    doc.text("Total", 480, tableTop);

    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();

    let position = tableTop + 25;

    invoice.items.forEach(item => {
      doc.text(item.productName, 50, position);
      doc.text(item.quantity, 300, position);
      doc.text(item.price, 350, position);
      doc.text(item.gst, 420, position);
      doc.text(item.total.toFixed(2), 480, position);
      position += 20;
    });

    doc.moveDown(3);

    doc.moveTo(350, position)
       .lineTo(550, position)
       .stroke();

    position += 10;

    doc.text(`Subtotal: ₹ ${invoice.subtotal.toFixed(2)}`, 350, position);
    position += 20;
    doc.text(`GST: ₹ ${invoice.gstTotal.toFixed(2)}`, 350, position);
    position += 20;
    doc.fontSize(14)
       .text(`Grand Total: ₹ ${invoice.grandTotal.toFixed(2)}`, 350, position);

    doc.moveDown(4);
    doc.fontSize(10).text("Thank you for your business!", { align: "center" });

    doc.end();

  } catch (error) {
    res.status(500).json({ message: "PDF generation failed" });
  }
};
