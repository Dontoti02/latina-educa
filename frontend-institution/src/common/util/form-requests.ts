export class FormRequest {
  static build = (data: object): FormData => {
    const formData = new FormData()

    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value))
        value.forEach((item, index) => formData.append(`files[${index}]`, item))
      formData.append(key, value)
    }

    return formData
  }

}

export default new FormRequest()
