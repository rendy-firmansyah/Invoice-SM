"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InvoiceForm() {
  const [clientInfo, setClientInfo] = useState({
    name: "",
    address: "",
    email: "",
    invoiceNumber: "INV-SM001",
    date: new Date().toLocaleDateString(),
  });

  const [items, setItems] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const handleClientChange = (field, value) => {
    setClientInfo({ ...clientInfo, [field]: value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === "quantity" || field === "unitPrice") {
      const parsed = parseFloat(value);
      newItems[index][field] = isNaN(parsed) ? 0 : parsed;
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const buildPDF = (doc, logoImage) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerY = 20;
    const sectionWidth = pageWidth / 3;

    const logoX = 15;
    const logoWidth = 40;

    if (logoImage && logoImage.width && logoImage.height) {
      const aspectRatio = logoImage.height / logoImage.width;
      const computedHeight = logoWidth * aspectRatio;
      doc.addImage(
        logoImage,
        "PNG",
        logoX,
        centerY - 10,
        logoWidth,
        computedHeight
      );
    }

    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(112, 14, 210);
    doc.text("INVOICE", pageWidth / 2, centerY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${clientInfo.date}`, pageWidth - 15, centerY - 3, {
      align: "right",
    });
    doc.text(
      `Invoice #: ${clientInfo.invoiceNumber}`,
      pageWidth - 15,
      centerY + 3,
      {
        align: "right",
      }
    );

    const lineTop = 10;
    const lineBottom = 30;
    const firstDividerX = sectionWidth;
    const secondDividerX = sectionWidth * 2;

    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(firstDividerX, lineTop, firstDividerX, lineBottom);
    doc.line(secondDividerX, lineTop, secondDividerX, lineBottom);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("BILL TO", 15, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const boxX = 15;
    const boxY = 54;
    const boxWidth = 100;
    const lineHeight = 8;
    const fields = [
      `Client Name: ${clientInfo.name}`,
      `Client Address: ${clientInfo.address}`,
      `Client Email: ${clientInfo.email}`,
    ];

    fields.forEach((text, i) => {
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(200);
      doc.rect(boxX, boxY + i * lineHeight, boxWidth, lineHeight, "FD");
      doc.setTextColor(0, 0, 0);
      doc.text(text, boxX + 2, boxY + 5 + i * lineHeight);
    });

    const tableBody = items.map((item) => [
      item.description,
      item.quantity,
      `Rp. ${item.unitPrice.toLocaleString("id-ID")}`,
      `Rp. ${(item.unitPrice * item.quantity).toLocaleString("id-ID")}`,
    ]);

    autoTable(doc, {
      head: [["DESCRIPTION", "QUANTITY", "UNIT PRICE", "TOTAL"]],
      body: tableBody,
      startY: 85,
      styles: { halign: "left" },
      headStyles: {
        fillColor: [148, 85, 212],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(112, 14, 210);
    doc.text(
      `SUB TOTAL: Rp. ${total.toLocaleString("id-ID")}`,
      pageWidth - 15,
      doc.lastAutoTable.finalY + 12,
      { align: "right" }
    );
  };

  // ✅ Di luar buildPDF
  const generatePDF = () => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/logo_sindology.png";
    logo.onload = () => {
      buildPDF(doc, logo);
      doc.save("invoice.pdf");
    };
    logo.onerror = () => {
      buildPDF(doc, null);
      doc.save("invoice.pdf");
    };
  };

  const previewPDF = () => {
    const doc = new jsPDF();
    const loadLogo = () =>
      new Promise((resolve) => {
        const logo = new Image();
        logo.src = "/logo_sindology.png";
        logo.onload = () => resolve(logo);
        logo.onerror = () => resolve(null);
      });

    loadLogo().then((logo) => {
      buildPDF(doc, logo);
      const pdfUrl = doc.output("bloburl");
      window.open(pdfUrl);
    });
  };

  return (
    <div
      className="p-6 max-w-4xl mx-auto bg-white text-black rounded-lg space-y-6"
      style={{
        boxShadow: "0 10px 15px -3px rgba(112, 14, 210, 0.8)", // ungu (sesuai warna invoice-mu)
      }}
    >
      <h2 className="text-xl font-bold text-center text-[#700ED2]">
        Invoice Generator Sindology Multiuser
      </h2>
      <div className="grid grid-cols-2 gap-4 ">
        <input
          placeholder="Client Name"
          value={clientInfo.name}
          onChange={(e) => handleClientChange("name", e.target.value)}
          className="border p-2 rounded border-[#700ED2]"
        />
        <input
          placeholder="Client Address"
          value={clientInfo.address}
          onChange={(e) => handleClientChange("address", e.target.value)}
          className="border p-2 rounded border-[#700ED2]"
        />
        <input
          placeholder="Client Email"
          value={clientInfo.email}
          onChange={(e) => handleClientChange("email", e.target.value)}
          className="border p-2 rounded border-[#700ED2]"
        />
        <input
          placeholder="Invoice Number"
          value={clientInfo.invoiceNumber}
          onChange={(e) => handleClientChange("invoiceNumber", e.target.value)}
          className="border p-2 rounded border-[#700ED2]"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Items</h3>
          <p className="text-sm">(Description - Quantity - Price)</p>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-3">
            <input
              placeholder="Description"
              value={item.description}
              onChange={(e) =>
                handleItemChange(idx, "description", e.target.value)
              }
              className="border p-2 rounded border-[#700ED2]"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={isNaN(item.quantity) ? "" : item.quantity}
              onChange={(e) =>
                handleItemChange(idx, "quantity", e.target.value)
              }
              className="border p-2 rounded border-[#700ED2]"
            />
            <input
              type="number"
              placeholder="Unit Price"
              value={isNaN(item.unitPrice) ? "" : item.unitPrice}
              onChange={(e) =>
                handleItemChange(idx, "unitPrice", e.target.value)
              }
              className="border p-2 rounded border-[#700ED2]"
            />
          </div>
        ))}
        <button
          onClick={addItem}
          className="text-sm text-[#700ED2] hover:underline"
        >
          + Add Item
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={generatePDF}
          className="bg-[#700ED2] text-white px-4 py-2 rounded hover:bg-[#a074cc] transition-all ease-linear"
        >
          Download Invoice PDF
        </button>
        <button
          onClick={previewPDF}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all ease-linear"
        >
          Preview PDF
        </button>
      </div>
    </div>
  );
}
