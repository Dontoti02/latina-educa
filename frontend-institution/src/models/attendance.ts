export interface AttendanceListItem {
  date: string
  value: string
}

export interface AttendanceListRequest {
  classroom_id: number
  date: string
}
export interface CapacitationAttendanceListRequest {
  training_id: number
  date: string
}

export interface AttendanceCreateRequest {
  classroom_id: number
  date: string
}
export interface CapacitationAttendanceCreateRequest {
  training_id: number
  date: string
}

export interface Attendance {
  id: number
  person: string
  photo: string | null
  status: 'attended' | 'absence' | 'late' | null
  date: string | null
  reason: string | null
  loading?: boolean
}

export interface AttendanceDate {
  date: string
  option: 1
}

export interface AttendanceMark {
  status: 'attended' | 'absence' | 'late' | null
  reason?: string
}
