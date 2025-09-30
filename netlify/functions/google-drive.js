const { google } = require("googleapis");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { action, payload, credentials } = JSON.parse(event.body);

  if (!credentials) {
    return { statusCode: 400, body: "Credentials are required." };
  }

  try {
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/presentations",
      ]
    );

    const drive = google.drive({ version: "v3", auth });
    const slides = google.slides({ version: "v1", auth });

    switch (action) {
      case "createFolderStructure":
        const { brandName, userName, userEmail } = payload;

        // 1. Create brand folder
        const date = new Date();
        const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
        const brandFolderName = `${brandName}_${dateStr}`;
        const brandFolderRes = await drive.files.create({
          requestBody: {
            name: brandFolderName,
            mimeType: "application/vnd.google-apps.folder",
          },
          fields: "id, name, webViewLink",
        });
        const brandFolder = brandFolderRes.data;

        // 2. Create user subfolder
        const userFolderName = userName.replace(/\s+/g, "_");
        const userFolderRes = await drive.files.create({
          requestBody: {
            name: userFolderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: [brandFolder.id],
          },
          fields: "id, name, webViewLink",
        });
        const userFolder = userFolderRes.data;

        // 3. Create guide slides
        const slidesTitle = `${brandName}_${userFolderName}_guide`;
        const slidesRes = await slides.presentations.create({
            title: slidesTitle,
        });
        const presentationId = slidesRes.data.presentationId;

        await drive.files.update({
            fileId: presentationId,
            addParents: userFolder.id,
            removeParents: 'root',
            fields: 'id, parents'
        });

        const fileRes = await drive.files.get({
            fileId: presentationId,
            fields: 'id, name, webViewLink'
        });
        const presentation = fileRes.data;


        // 4. Share folder with user
        if (userEmail) {
          await drive.permissions.create({
            fileId: userFolder.id,
            requestBody: {
              type: "user",
              role: "writer",
              emailAddress: userEmail,
            },
            sendNotificationEmail: true,
          });
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            driveUrl: userFolder.webViewLink,
            slidesUrl: presentation.webViewLink,
          }),
        };

      default:
        return { statusCode: 400, body: "Invalid action." };
    }
  } catch (error) {
    console.error("Google Drive API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

