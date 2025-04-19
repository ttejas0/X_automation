import { google } from "googleapis";

function getRandomTimeBetween7AMand11PM() {
  const startHour = 7;
  const endHour = 23;

  const hour =
    Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minute = Math.floor(Math.random() * 60);

  return { hour, minute };
}

export async function uploadToGoogleSheets(tweetData) {
  const spreadSheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  try {
    if (!spreadSheetId) {
      console.error("Error: GOOGLE_SPREADSHEET_ID is not defined");
      return;
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const newSheetName = `${year}-${month}-${day}`;

    const tweetsArray = Object.entries(tweetData).map(([key, value]) => {
      const { hour, minute } = getRandomTimeBetween7AMand11PM();
      const timeStr = `${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;
      const dateTime = `${year}-${month}-${day} ${timeStr}`;
      return [key, value, dateTime];
    });

    // Step 1: Add the new sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadSheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: newSheetName,
              },
            },
          },
        ],
      },
    });

    // Step 2: Write data to the new sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadSheetId,
      range: `${newSheetName}!A1`, // Top-left cell
      valueInputOption: "RAW",
      requestBody: {
        values: [["Key", "Value", "Scheduled Time"], ...tweetsArray], // Header + tweetData
      },
    });

    console.log(`✅ Data uploaded to sheet: ${newSheetName}`);
  } catch (error) {
    console.error("❌ Error adding tweets to Google Sheet:", error.message);
  }
}
