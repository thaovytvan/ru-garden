export const printInvoice = (order: any) => {
  if (!order) return;

  const printWindow = window.open("", "_blank", "width=400,height=600");
  if (!printWindow) return;

  const itemsHtml = order.items
    .map(
      (item: any) => `
    <div style="margin-bottom: 5px;">
      <div style="font-weight: bold; font-size: 13px;">${item.product.name}</div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 2px;">
        <span>${item.quantity} x ${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item.price)}</span>
        <span style="font-weight: bold;">${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item.price * item.quantity)}</span>
      </div>
    </div>
  `
    )
    .join("");

  const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const discountAmount = order.discountAmount || 0;

  const discountHtml = order.discountCode 
    ? `<div style="display: flex; justify-content: end; margin-bottom: 2px; font-style: italic;">
         <span>Voucher (${order.discountCode})</span>
       </div>`
    : "";

  const discountAmountHtml = discountAmount > 0
    ? `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
         <span>Giảm trực tiếp:</span>
         <span>-${new Intl.NumberFormat("vi-VN", {
           style: "currency",
           currency: "VND",
         }).format(discountAmount)}</span>
       </div>`
    : "";

  const html = `
    <html>
      <head>
        <title>Biên lai #${order.id.slice(-8)}</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 80mm; 
            padding: 5mm; 
            margin: 0; 
            font-size: 12px; 
            color: #000;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .header { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .shop-name { font-size: 18px; font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
          .item-list { margin: 10px 0; }
          .total-section { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .footer { margin-top: 20px; font-size: 10px; }
          @media print {
            body { width: 80mm; }
          }
        </style>
      </head>
      <body>
        <div class="header center">
          <div class="shop-name">RÚ GARDEN</div>
          <div style="font-size: 10px;">Vườn Cây Mini - Phụ Kiện Decor</div>
          <div style="font-size: 10px;">Địa chỉ: Bồ Bản, Nam Cửa Việt, Quảng Trị</div>
          <div style="font-size: 10px;">SĐT: 0969 847 030</div>
        </div>
        
        <div class="center bold" style="font-size: 14px; margin-bottom: 10px;">BIÊN LAI BÁN HÀNG</div>
        
        <div style="font-size: 11px;">
          <div class="row"><span>Mã đơn:</span> <span class="bold">#${order.id.slice(-8).toUpperCase()}</span></div>
          <div class="row"><span>Ngày:</span> <span>${new Date(order.createdAt).toLocaleString("vi-VN")}</span></div>
          <div class="row"><span>Khách hàng:</span> <span>${order.customerName || "Khách lẻ"}</span></div>
          <div class="row"><span>SĐT:</span> <span>${order.phone || "N/A"}</span></div>
        </div>

        <div class="divider"></div>

        <div class="item-list">
          ${itemsHtml}
        </div>

        <div class="divider"></div>

        <div class="total-section">
          <div class="row" style="font-size: 11px; color: #666;">
            <span>Tạm tính:</span>
            <span>${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(subtotal)}</span>
          </div>
          ${discountHtml}
          ${discountAmountHtml}
          <div class="row" style="font-size: 14px; font-weight: bold; margin-top: 5px;">
            <span>TỔNG CỘNG:</span>
            <span>${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(order.totalAmount)}</span>
          </div>
        </div>

        <div class="footer center">
          <div class="bold italic">Cảm ơn quý khách!</div>
          <div style="margin-top: 5px;">Hẹn gặp lại quý khách tại Rú Garden</div>
          <div style="font-size: 8px; margin-top: 10px;">Website: rugarden.com</div>
        </div>
        
        <script>
          window.onload = function() { 
            window.print(); 
            window.setTimeout(function(){ window.close(); }, 500); 
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
