import { google } from 'googleapis';

/**
 * Google Drive API 서비스 클래스
 * 구글 드라이브 API를 사용하여 폴더 생성, 권한 설정, 슬라이드 생성 등의 기능을 제공합니다.
 */
class GoogleDriveService {
  constructor() {
    this.initialized = false;
    this.auth = null;
    this.driveClient = null;
    this.slidesClient = null;
  }

  /**
   * 서비스 계정 인증 정보로 초기화
   * @param {Object} credentials - 서비스 계정 인증 정보
   * @returns {boolean} - 초기화 성공 여부
   */
  initialize(credentials) {
    try {
      if (!credentials) {
        console.error('인증 정보가 제공되지 않았습니다.');
        return false;
      }

      // JWT 클라이언트 생성
      this.auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/presentations'
        ]
      );

      // Drive API 클라이언트 생성
      this.driveClient = google.drive({
        version: 'v3',
        auth: this.auth
      });

      // Slides API 클라이언트 생성
      this.slidesClient = google.slides({
        version: 'v1',
        auth: this.auth
      });

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Google Drive 서비스 초기화 오류:', error);
      return false;
    }
  }

  /**
   * 초기화 상태 확인
   * @returns {boolean} - 초기화 여부
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * 폴더 생성
   * @param {string} folderName - 생성할 폴더 이름
   * @param {string} parentFolderId - 상위 폴더 ID (없으면 루트에 생성)
   * @returns {Promise<Object>} - 생성된 폴더 정보
   */
  async createFolder(folderName, parentFolderId = null) {
    if (!this.isInitialized()) {
      throw new Error('Google Drive 서비스가 초기화되지 않았습니다.');
    }

    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      };

      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      const response = await this.driveClient.files.create({
        resource: fileMetadata,
        fields: 'id, name, webViewLink'
      });

      return response.data;
    } catch (error) {
      console.error('폴더 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 파일 또는 폴더에 사용자 권한 부여
   * @param {string} fileId - 파일 또는 폴더 ID
   * @param {string} emailAddress - 권한을 부여할 사용자 이메일
   * @param {string} role - 권한 역할 (reader, writer, commenter, owner)
   * @returns {Promise<Object>} - 생성된 권한 정보
   */
  async shareWithUser(fileId, emailAddress, role = 'writer') {
    if (!this.isInitialized()) {
      throw new Error('Google Drive 서비스가 초기화되지 않았습니다.');
    }

    try {
      const permission = {
        type: 'user',
        role: role,
        emailAddress: emailAddress
      };

      const response = await this.driveClient.permissions.create({
        fileId: fileId,
        resource: permission,
        fields: 'id',
        sendNotificationEmail: true
      });

      return response.data;
    } catch (error) {
      console.error('권한 설정 오류:', error);
      throw error;
    }
  }

  /**
   * 슬라이드 프레젠테이션 생성
   * @param {string} title - 프레젠테이션 제목
   * @param {string} parentFolderId - 상위 폴더 ID (없으면 루트에 생성)
   * @returns {Promise<Object>} - 생성된 프레젠테이션 정보
   */
  async createPresentation(title, parentFolderId = null) {
    if (!this.isInitialized()) {
      throw new Error('Google Drive 서비스가 초기화되지 않았습니다.');
    }

    try {
      // 먼저 빈 프레젠테이션 생성
      const presentation = await this.slidesClient.presentations.create({
        requestBody: {
          title: title
        }
      });

      const presentationId = presentation.data.presentationId;

      // 생성된 프레젠테이션을 지정된 폴더로 이동 (필요한 경우)
      if (parentFolderId) {
        await this.driveClient.files.update({
          fileId: presentationId,
          addParents: parentFolderId,
          fields: 'id, parents'
        });
      }

      // 프레젠테이션 정보 조회
      const file = await this.driveClient.files.get({
        fileId: presentationId,
        fields: 'id, name, webViewLink'
      });

      return file.data;
    } catch (error) {
      console.error('프레젠테이션 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 브랜드와 사용자 정보를 기반으로 폴더 구조 생성
   * @param {string} brandName - 브랜드명
   * @param {string} userName - 사용자 이름
   * @param {string} userEmail - 사용자 이메일
   * @returns {Promise<Object>} - 생성된 폴더 및 슬라이드 정보
   */
  async createFolderStructureForUser(brandName, userName, userEmail) {
    if (!this.isInitialized()) {
      throw new Error('Google Drive 서비스가 초기화되지 않았습니다.');
    }

    try {
      // 1. 브랜드 폴더 생성 (날짜 포함)
      const date = new Date();
      const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      const brandFolderName = `${brandName}_${dateStr}`;
      
      const brandFolder = await this.createFolder(brandFolderName);
      
      // 2. 사용자 하위 폴더 생성
      const userFolderName = userName.replace(/\s+/g, '_');
      const userFolder = await this.createFolder(userFolderName, brandFolder.id);
      
      // 3. 가이드 슬라이드 생성
      const slidesTitle = `${brandName}_${userFolderName}_guide`;
      const slides = await this.createPresentation(slidesTitle, userFolder.id);
      
      // 4. 사용자에게 폴더 접근 권한 부여
      if (userEmail) {
        await this.shareWithUser(userFolder.id, userEmail, 'writer');
      }
      
      return {
        brandFolder: brandFolder,
        userFolder: userFolder,
        slides: slides
      };
    } catch (error) {
      console.error('폴더 구조 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 파일 또는 폴더 정보 조회
   * @param {string} fileId - 파일 또는 폴더 ID
   * @returns {Promise<Object>} - 파일 또는 폴더 정보
   */
  async getFileInfo(fileId) {
    if (!this.isInitialized()) {
      throw new Error('Google Drive 서비스가 초기화되지 않았습니다.');
    }

    try {
      const response = await this.driveClient.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, webViewLink, parents'
      });

      return response.data;
    } catch (error) {
      console.error('파일 정보 조회 오류:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
const googleDriveService = new GoogleDriveService();

export default googleDriveService;
