function refreshBranchSalesData() {

  const TARGET_SHEET = "Branches Sales Data";
  const YEAR = 2026;
  const MONTH = 6;

  const sources = [
    {
      id: "<BRANCH_JAKARTA_SPREADSHEET_ID>",
      startCol: 1 // A:E
    },
    {
      id: "<BRANCH_SURABAYA_SPREADSHEET_ID>",
      startCol: 7 // G:K
    },
    {
      id: "<BRANCH_SEMARANG_SPREADSHEET_ID>",
      startCol: 13 // M:Q
    },
    {
  id: "<BRANCH_BANDUNG_SPREADSHEET_ID>",
  startCol: 19, // S:W
  startRow: 1
}
  ];

  const ssTarget = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTarget = ssTarget.getSheetByName(TARGET_SHEET);

  sources.forEach(branch => {

    const transactions = [];

    const file = SpreadsheetApp.openById(branch.id);
      Logger.log("FILE = " + file.getName());
    
  file.getSheets().forEach(sheet => {

  const sheetName = sheet.getName();

  const match = sheetName.match(/^(\d+)\s+Juni$/i);

  if (!match) return;

  const day = Number(match[1]);

  const date = new Date(YEAR, MONTH - 1, day);

  const data = sheet.getDataRange().getValues();

  for (let r = (branch.startRow ?? 4); r < data.length; r++) {

    const salesperson = data[r][0];   // A
    const invoice = data[r][1];       // B
    const payment = data[r][4];       // E
    const amount = data[r][6];        // G

    if (!invoice) continue;

    if (
      payment === "Cash" ||
      payment === "TF BCA" ||
      payment === "EDC BCA" ||
      payment === "Qris"
    ) {

      transactions.push([
        invoice,
        date,
        "General Customer",
        amount,
        salesperson
      ]);
    }
  }

});

    Logger.log(
  file.getName() +
  " -> " +
  transactions.length +
  " transactions"
);

transactions.sort((a, b) => a[1] - b[1]);

sheetTarget
  .getRange(14, branch.startCol, 10000, 5)
  .clearContent();

if (transactions.length > 0) {

  sheetTarget
    .getRange(14, branch.startCol, transactions.length, 5)
    .setValues(transactions);

  sheetTarget
    .getRange(14, branch.startCol + 1, transactions.length, 1)
    .setNumberFormat("dd/MM/yyyy");

    }

  });
}

function refreshMarketplaceData() {

  const SOURCE_ID = "<BRANCH_JAKARTA_SPREADSHEET_ID>";
  const YEAR = 2026;
  const MONTH = 6;

  const sourceSpreadsheet = SpreadsheetApp.openById(SOURCE_ID);

  const targetSheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Marketplace Data");

  targetSheet.getRange("B2:E10000").clearContent();

  let marketplaceTransactions = [];

  sourceSpreadsheet.getSheets().forEach(sheet => {

    const match = sheet.getName().match(/^(\d+)\s+Juni$/i);

    if (!match) return;

    const date = new Date(
      YEAR,
      MONTH - 1,
      Number(match[1])
    );

    const data = sheet.getDataRange().getValues();

    for (let i = 4; i < data.length; i++) {

      const invoice = data[i][1];      // Column B
      const channel = String(data[i][5]).trim().toUpperCase(); // Column F
      const amount = data[i][6];       // Column G

      if (!invoice) continue;

      if (
        channel === "SHOPEE" ||
        channel === "TOKOPEDIA" ||
        channel === "TIKTOKSHOP"
      ) {

        marketplaceTransactions.push([
          invoice,
          channel,
          date,
          amount
        ]);

      }

    }

  });

  marketplaceTransactions.sort((a, b) => a[2] - b[2]);

  if (marketplaceTransactions.length > 0) {

    targetSheet
      .getRange(2, 2, marketplaceTransactions.length, 4)
      .setValues(marketplaceTransactions);

    targetSheet
      .getRange(2, 4, marketplaceTransactions.length, 1)
      .setNumberFormat("dd/MM/yyyy");

  }

}

function refreshAllReports() {

  refreshBranchSalesData();

  refreshMarketplaceData();

  SpreadsheetApp.getUi().alert(
    "Sales reports refreshed successfully."
  );

}