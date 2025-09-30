const { google } = require("googleapis");

exports.handler = async function (event, context) {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight 성공' })
    };
  }

  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const { action, payload, credentials } = JSON.parse(event.body);

  if (!credentials) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ error: "Credentials are required." })
    };
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
          headers,
          body: JSON.stringify({
            driveUrl: userFolder.webViewLink,
            slidesUrl: presentation.webViewLink,
          }),
        };
      
      case "listFiles":
        const { folderId, pageSize = 100, pageToken } = payload;
        
        const query = folderId ? `'${folderId}' in parents` : '';
        
        const listResponse = await drive.files.list({
          q: query,
          pageSize: pageSize,
          fields: 'nextPageToken, files(id, name, mimeType, webViewLink, iconLink, thumbnailLink, createdTime, modifiedTime, size)',
          pageToken: pageToken || null
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(listResponse.data)
        };
      
      case "createFolder":
        const { folderName, parentFolderId } = payload;
        
        const folderMetadata = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        };
        
        if (parentFolderId) {
          folderMetadata.parents = [parentFolderId];
        }
        
        const folderResponse = await drive.files.create({
          requestBody: folderMetadata,
          fields: 'id, name, webViewLink'
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(folderResponse.data)
        };
      
      case "shareFile":
        const { fileId, email, role = 'reader' } = payload;
        
        const permissionResponse = await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            type: 'user',
            role: role,
            emailAddress: email
          },
          fields: 'id'
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(permissionResponse.data)
        };
      
      case "getFileInfo":
        const { targetFileId } = payload;
        
        const fileInfoResponse = await drive.files.get({
          fileId: targetFileId,
          fields: 'id, name, mimeType, webViewLink, iconLink, thumbnailLink, createdTime, modifiedTime, size'
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(fileInfoResponse.data)
        };

      default:
        return { 
          statusCode: 400, 
          headers,
          body: JSON.stringify({ error: "Invalid action." })
        };
    }
  } catch (error) {
    console.error("Google Drive API Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
