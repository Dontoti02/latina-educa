export interface UploadFileDto {
  model: 'content' | 'answer' | 'publication' | 'content_group' | 'training_content_group' | 'training_content' | 'training_answer' | 'training_publication'
  model_id: number
  chunk: Blob
  chunk_uid: string
  chunk_name: string
  chunk_total: number
  chunk_number: number
}
