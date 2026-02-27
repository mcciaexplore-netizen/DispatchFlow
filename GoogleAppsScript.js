/**
 * DispatchFlow — Google Apps Script Write Proxy
 * ─────────────────────────────────────────────
 * This script lets DispatchFlow write rows to your Google Sheet
 * without needing OAuth2. The Google Sheets API read-only key
 * (already in Settings) handles fetching history.
 *
 * HOW TO DEPLOY:
 * 1. Go to https://script.google.com and click "New Project".
 * 2. Delete any existing code and paste the entire content of this file.
 * 3. Click "Deploy" → "New Deployment".
 * 4. Select type: "Web App".
 * 5. Set "Execute as" → Me (your Google account).
 * 6. Set "Who has access" → Anyone.
 * 7. Click "Deploy" and authorise when prompted.
 * 8. Copy the Web App URL (looks like https://script.google.com/macros/s/.../exec).
 * 9. Paste that URL into Settings → Data Storage → Apps Script URL in DispatchFlow.
 *
 * NOTE: The script must have access to the Spreadsheet.
 * Your Google account (used to deploy) must be the owner or editor of the Sheet.
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheetId = payload.sheetId;
    var tabName = payload.tabName;
    var row = payload.row;

    if (!sheetId || !tabName || !Array.isArray(row)) {
      throw new Error("Missing required fields: sheetId, tabName, or row.");
    }

    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName(tabName);

    if (!sheet) {
      throw new Error("Tab '" + tabName + "' not found in spreadsheet.");
    }

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: test this function manually in the Apps Script editor
function testAppend() {
  var testEvent = {
    postData: {
      contents: JSON.stringify({
        sheetId: "YOUR_SHEET_ID_HERE",
        tabName: "Sheet1",
        row: ["TEST-001", new Date().toISOString(), "Test Item", "BATCH-A", "Grade-1", "10", "pcs", "100 kg", "PO-001", "Test Customer", "Pune", "MH12AB1234", "John", "ABC Transport", "", "", "", "dispatched"]
      })
    }
  };
  var result = doPost(testEvent);
  Logger.log(result.getContent());
}
