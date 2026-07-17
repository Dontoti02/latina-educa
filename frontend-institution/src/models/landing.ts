export interface GetLandingPage {
  institution: {
    name: string
    description: string
    logo: string
  }
  banners: string[]
  services: {
    title: string
    description: string
    arrServices: {
      name: string
      description: string
      icon: string
    }[]
  }
  news: {
    title: string
    description: string
    arrNews: {
      title: string
      description: string
      icon: string
    }[]
  }
  teachers: {
    title: string
    description: string
    arrTeachers: {
      name: string
      description: string
      image: string
    }[]
  }
  careers: {
    title: string
    description: string
    arrCareers: {
      name: string
      icon: string
      courses: string[]
    }[]
  }
  summary: {
    value: string
    label: string
    icon: string
  }[]
  contact_information: {
    phones: string[]
    emails: string[]
  }
  url:string
}

export interface LandingData {
  institution: Institution
  banners: string[]
  services: Services
  news: News
  teachers: Teachers
  careers: Careers
  summary: Summary[]
  contact_information: ContactInformation
}

export interface Institution {
  name: string
  description: string
  logo: string
}

export interface Services {
  title: string
  description: string
  arrServices: ArrService[]
}

export interface ArrService {
  name: string
  description: string
  icon: string
}

export interface News {
  title: string
  description: string
  arrNews: ArrNew[]
}

export interface ArrNew {
  icon: string
  title: string
  description: string
}

export interface Teachers {
  title: string
  description: string
  arrTeachers: ArrTeacher[]
}

export interface ArrTeacher {
  image: string
  name: string
  description: string
}

export interface Careers {
  title: string
  description: string
  arrCareers: ArrCareer[]
}

export interface ArrCareer {
  name: string
  icon: string
  courses: string[]
}

export interface Summary {
  value: string
  label: string
  icon: string
}

export interface ContactInformation {
  phones: string[]
  emails: string[]
}
export interface BannerForDragger {
  image: string
  dummyUuid: string | null
}

export interface NewBanner {
  image: string
  file: File
  dummyUuid: string | null
}

export interface NewTeacher {
  name: string
  description: string
  image: string | null
  file: File | null
}
