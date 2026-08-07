import axios from 'axios'
import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants'

export interface UploadResumeResponse {
  file_id: string
  filename: string
  size: number
  url: string
}

export const fileService = {
  async uploadResume(file: File): Promise<UploadResumeResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Create a request without the default application/json header
    // Let axios/browser automatically set multipart/form-data with boundary
    const res = await axios.post<UploadResumeResponse>(
      `${API_BASE_URL}/files/upload-resume`,
      formData,
      {
        headers, // Only auth header, NO Content-Type
        timeout: 120000,
      }
    )
    
    // Ensure the download URL is absolute
    const downloadUrl = res.data.url
    const fullDownloadUrl = downloadUrl.startsWith('http') 
      ? downloadUrl 
      : `${API_BASE_URL}${downloadUrl}`
    
    return {
      ...res.data,
      url: fullDownloadUrl,
    }
  },

  getResumeDownloadUrl(fileId: string): string {
    return `${API_BASE_URL}/files/download-resume/${fileId}`
  },
}
