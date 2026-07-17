export const getTypeResource = (extension: string): 'video' | 'audio' | 'pdf' | 'image' | 'link' | 'file' | 'word' | 'excel' | 'ppt' | 'zip' => {
  switch (extension) {
    case 'mp4':
    case 'webm':
    case 'ogg':
      return 'video'
    case 'mp3':
    case 'wav':
      return 'audio'
    case 'pdf':
      return 'pdf'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image'
    case 'txt':
    case 'html':
    case 'xml':
    case 'json':
    case 'csv':
    case 'application':
      return 'link'
    case 'doc':
    case 'docx':
      return 'word'
    case 'xls':
    case 'xlsx':
      return 'excel'
    case 'ppt':
    case 'pptx':
      return 'ppt'
    case 'zip':
      return 'zip'
    default:
      return 'file'
  }
}

export const getIcon = (type: string) => {
  switch (type) {
    case 'file':
      return 'tabler-file'
    case 'link':
      return 'tabler-link'
    case 'video':
      return 'tabler-video'
    case 'audio':
      return 'tabler-music'
    case 'image':
      return 'tabler-photo'
    case 'pdf':
      return 'tabler-file-type-pdf'
    case 'word':
      return 'tabler-file-type-doc'
    case 'excel':
      return 'tabler-file-spreadsheet'
    case 'powerpoint':
      return 'tabler-file-type-ppt'
    case 'zip':
      return 'tabler-file-zip'
    default:
      return 'tabler-file'
  }
}
