import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import './App.css'

interface DownloadTask {
  id: string
  url: string
  file_name: string
  save_path: string
  total_size: number
  downloaded_size: number
  status: string
  created_at: number
  updated_at: number
}

function App() {
  const [downloads, setDownloads] = useState<DownloadTask[]>([])
  const [url, setUrl] = useState('')
  const [savePath, setSavePath] = useState('')

  useEffect(() => {
    loadDownloads()
  }, [])

  const loadDownloads = async () => {
    try {
      const tasks = await invoke<DownloadTask[]>('get_downloads')
      setDownloads(tasks)
    } catch (error) {
      console.error('Failed to load downloads:', error)
    }
  }

  const createDownload = async () => {
    if (!url || !savePath) return

    try {
      await invoke('create_download', { url, savePath })
      setUrl('')
      await loadDownloads()
    } catch (error) {
      console.error('Failed to create download:', error)
    }
  }

  const removeDownload = async (id: string) => {
    try {
      await invoke('remove_download', { id })
      await loadDownloads()
    } catch (error) {
      console.error('Failed to remove download:', error)
    }
  }

  return (
    <div className="container">
      <h1>Vortex Downloader</h1>

      <div className="create-form">
        <input
          type="text"
          placeholder="Download URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="Save path"
          value={savePath}
          onChange={(e) => setSavePath(e.target.value)}
        />
        <button onClick={createDownload}>Add Download</button>
      </div>

      <div className="downloads-list">
        <h2>Downloads ({downloads.length})</h2>
        {downloads.map((download) => (
          <div key={download.id} className="download-item">
            <div className="download-info">
              <h3>{download.file_name}</h3>
              <p>{download.url}</p>
              <p>Size: {download.downloaded_size} / {download.total_size} bytes</p>
              <p>Status: {download.status}</p>
            </div>
            <div className="download-actions">
              <button onClick={() => removeDownload(download.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
