import { database } from './supabase';

// Google Drive API 상태 확인 함수
const checkGoogleDriveApiStatus = async () => {
  try {
    const settings = await database.system.getSettings();
    return {
      initialized: !!(settings && settings.google_drive_credentials),
      error: null
    };
  } catch (error) {
    console.error('Error checking Google Drive API status:', error);
    return {
      initialized: false,
      error: error.message
    };
  }
};

// 시스템 설정에서 초기화
const initializeFromSystemSettings = async () => {
  try {
    const settings = await database.system.getSettings();
    if (!settings || !settings.google_drive_credentials) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error initializing Google Drive API:', error);
    return false;
  }
};

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

// 파일 목록 조회 함수
const listFiles = async (folderId = null, pageSize = 100, pageToken = null) => {
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
        action: 'listFiles',
        payload: {
          folderId,
          pageSize,
          pageToken
        },
        credentials,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to list files.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// 폴더 생성 함수
const createFolder = async (folderName, parentFolderId = null) => {
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
        action: 'createFolder',
        payload: {
          folderName,
          parentFolderId
        },
        credentials,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create folder.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// 파일 공유 설정 함수
const shareFile = async (fileId, email, role = 'reader') => {
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
        action: 'shareFile',
        payload: {
          fileId,
          email,
          role
        },
        credentials,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to share file.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sharing file:', error);
    throw error;
  }
};

export default {
  createGoogleDriveFolders,
  checkGoogleDriveApiStatus,
  initializeFromSystemSettings,
  listFiles,
  createFolder,
  shareFile
};
