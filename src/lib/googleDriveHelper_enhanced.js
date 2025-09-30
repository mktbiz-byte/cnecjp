import { database } from './supabase';

const createGoogleDriveFolders = async (brandName, userName, userEmail) => {
  try {
    const settings = await database.system.getSettings();
    if (!settings || !settings.google_drive_credentials) {
      throw new Error('Google Drive API credentials not found in system settings.');
    }

    const credentials = JSON.parse(settings.google_drive_credentials);

    const response = await fetch('/.netlify/functions/google-drive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createFolderStructure',
        payload: { brandName, userName, userEmail },
        credentials,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create Google Drive folders.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Google Drive folders:', error);
    throw error;
  }
};

export default {
  createGoogleDriveFolders,
};
