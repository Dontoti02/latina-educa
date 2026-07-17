import {
  CapacitationForm,
  CapacitationsList,
  StudentsList,
  Teacher,
} from "@/models/capacitations";

export const CapacitationList: CapacitationsList = {
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 11,
  },
  filters: [
    {
      id: 1,
      name: "Category 1",
    },
    {
      id: 2,
      name: "Category 2",
    },
  ],
  capacitations: [
    {
      id: 1,
      frontPage: "https://niixer.com/wp-content/uploads/2023/03/principal.jpeg",
      category: "Category 1",
      status: "Active",
      studentsCount: 10,
      maxStudents: 25,
      name: "Capacitación en servicios de AWS 1",
      description:
        "Prepárate para obtener certificación AWS: domina servicios clave, seguridad, redes y despliegue en la nube con prácticas y simulacros. 1",
      leftTime: "10 days left",
      startDate: "2021-10-01",
      endDate: "2021-10-10",
      progress: 50,
      isFinished: false,
    },
    {
      id: 2,
      frontPage: "https://niixer.com/wp-content/uploads/2023/03/principal.jpeg",
      category: "Category 1",
      status: "Active",
      studentsCount: 20,
      maxStudents: 25,
      name: "Capacitación en servicios de AWS 2",
      description:
        "Prepárate para obtener certificación AWS: domina servicios clave, seguridad, redes y despliegue en la nube con prácticas y simulacros. 2",
      leftTime: "20 days left",
      startDate: "2021-10-01",
      endDate: "2021-10-20",
      progress: 40,
      isFinished: false,
    },
    {
      id: 3,
      frontPage: "https://niixer.com/wp-content/uploads/2023/03/principal.jpeg",
      category: "Category 1",
      status: "Active",
      studentsCount: 30,
      maxStudents: 25,
      name: "Capacitación en servicios de AWS 3",
      description:
        "Prepárate para obtener certificación AWS: domina servicios clave, seguridad, redes y despliegue en la nube con prácticas y simulacros. 3",
      leftTime: "30 days left",
      startDate: "2021-10-01",
      endDate: "2021-10-30",
      progress: 20,
      isFinished: true,
    },
    {
      id: 4,
      frontPage: "https://niixer.com/wp-content/uploads/2023/03/principal.jpeg",
      category: "Category 1",
      status: "Active",
      studentsCount: 40,
      maxStudents: 25,
      name: "Capacitación en servicios de AWS 4",
      description:
        "Prepárate para obtener certificación AWS: domina servicios clave, seguridad, redes y despliegue en la nube con prácticas y simulacros. 4",
      leftTime: "40 days left",
      startDate: "2021-10-01",
      endDate: "2021-11-10",
      progress: 10,
      isFinished: false,
    },
    {
      id: 5,
      frontPage: "https://niixer.com/wp-content/uploads/2023/03/principal.jpeg",
      category: "Category 1",
      status: "Active",
      studentsCount: 50,
      maxStudents: 25,
      name: "Capacitación en servicios de AWS 5",
      description:
        "Prepárate para obtener certificación AWS: domina servicios clave, seguridad, redes y despliegue en la nube con prácticas y simulacros. 5",
      leftTime: "50 days left",
      startDate: "2021-10-01",
      endDate: "2021-11-20",
      progress: 70,
      isFinished: true,
    },
    {
      id: 6,
      frontPage: "https://niixer.com/wp-content/uploads/2023/03/principal.jpeg",
      category: "Category 1",
      status: "Active",
      studentsCount: 60,
      maxStudents: 25,
      name: "Capacitación en servicios de AWS 6",
      description:
        "Prepárate para obtener certificación AWS: domina servicios clave, seguridad, redes y despliegue en la nube con prácticas y simulacros. 6",
      leftTime: "60 days left",
      startDate: "2021-10-01",
      endDate: "2021-11-30",
      progress: 90,
      isFinished: false,
    },
    {
      id: 7,
      frontPage: "https://niixer.com/wp-content/uploads/2023/03/principal.jpeg",
      category: "Category 1",
      status: "Active",
      studentsCount: 70,
      maxStudents: 25,
      name: "Capacitación en servicios de AWS 7",
      description:
        "Prepárate para obtener certificación AWS: domina servicios clave, seguridad, redes y despliegue en la nube con prácticas y simulacros. 7",
      leftTime: "70 days left",
      startDate: "2021-10-01",
      endDate: "2021-12-10",
      progress: 50,
      isFinished: false,
    },
  ],
};

export const TeachersList: Array<Teacher> = [
  {
    id: 1,
    name: "Hector Efrain Zamora Valladares",
    email: "hector@gmail.com",
    dni: "12345678",
  },
  {
    id: 2,
    name: "Danilo Andres Marcelo Quintana",
    email: "danilo@gmail.com",
    dni: "98765432",
  },
  {
    id: 3,
    name: "Jorge Renato Niño Palacios",
    email: "jorge@gmail.com",
    dni: "91827364",
  },
];

export const CapacitationDetails: CapacitationForm = {
  id: 1,
  name: "Capacitación en servicios de AWS",
  training_category_id: 1,
  shiftId: 1,
  num_max_absences: 10,
  start_date: "01/12/2024",
  end_date: "31/12/2024",
  min_participants: 10,
  max_participants: 50,
  short_description:
    "Prepárate para obtener certificación AWS: domina servicios clave, seguridad, redes y despliegue en la nube con prácticas y simulacros.",
  long_description:
    "Prepárate para obtener certificación AWS: domina servicios clave, seguridad, redes y despliegue en la nube con prácticas y simulacros.",
};

export const CapacitationFilters = {
  categories: [
    {
      id: 1,
      name: "Category 1",
    },
    {
      id: 2,
      name: "Category 2",
    },
  ],
  shifts: [
    {
      id: 1,
      name: "Morning",
    },
    {
      id: 2,
      name: "Afternoon",
    },
    {
      id: 3,
      name: "Night",
    },
  ],
};

export const Students = [
  {
    id: 1,
    user: "Juan Perez",
    dni: "71479560",
    createdAt: "01/01/2021",
    absences: 0,
    status: "Activo",
    role: "Estudiante",
  },
  {
    id: 2,
    user: "Maria Lopez",
    dni: "71479561",
    createdAt: "02/01/2021",
    absences: 1,
    status: "Retirado",
    role: "Estudiante",
  },
  {
    id: 3,
    user: "Carlos Sanchez",
    dni: "71479562",
    createdAt: "03/01/2021",
    absences: 2,
    status: "Inhabilitado",
    role: "Estudiante",
  },
  {
    id: 4,
    user: "Ana Martinez",
    dni: "71479563",
    createdAt: "04/01/2021",
    absences: 3,
    status: "Activo",
    role: "Estudiante",
  },
  {
    id: 5,
    user: "Luis Gomez",
    dni: "71479564",
    createdAt: "05/01/2021",
    absences: 4,
    status: "Activo",
    role: "Estudiante",
  },
];

export const StudentsResponse: StudentsList = {
  pagination: {
    totalItems: 50,
    itemsPerPage: 10,
    currentPage: 1,
  },
  students: Students,
  summary: {
    students: 50,
    teachers: 10,
    externals: 5,
    total: 65,
  },
  rolesFilters: [
    {
      id: 1,
      name: "Estudiante",
    },
    {
      id: 2,
      name: "Profesor",
    },
  ],
  statusFilters: [
    {
      id: 1,
      name: "Activo",
    },
    {
      id: 2,
      name: "Retirado",
    },
    {
      id: 3,
      name: "Suspendido",
    },
  ],
};
