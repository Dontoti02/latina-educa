export default [
  { heading: 'Aula virtual', subject: 'Aula virtual' },
  // {
  //   title: 'Área personal',
  //   icon: { icon: 'tabler-home-shield' },
  //   children: [
  //     { title: 'Tablón', to: 'personal-area-board', subject: 'Board' },
  //     { title: 'Calendario', to: 'personal-area-calendar', subject: 'Calendar' },
  //     { title: 'Almacenamiento', to: 'personal-area-storage', subject: 'Storage' },
  //   ],
  // },
  {
    title: 'Mis cursos',
    icon: { icon: 'tabler-school' },
    children: [
      { title: 'Actuales', to: 'courses-current', subject: 'CurrentCourses' },
      { title: 'Archivados', to: 'courses-archived', subject: 'ArchivedCourses' },
    ],
  },

  {
    title: 'Files',
    icon: { icon: 'tabler-school' },
    children: [
      { title: 'test', to: 'demos-upload' },
    ],
  },
]
