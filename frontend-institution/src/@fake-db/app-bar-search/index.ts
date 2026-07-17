// ** Mock Adapter
import mock from '@/@fake-db/mock'

// ** Types
import type { SearchHeader, SearchItem } from '@/@fake-db/types'

const database: SearchItem[] = [
  {
    id: 2,
    url: { name: 'courses' },
    icon: 'tabler-shopping-cart',
    title: 'eCommerce Dashboard',
    category: 'dashboards',
  },
  {
    id: 4,
    url: { name: 'apps-email' },
    icon: 'tabler-mail',
    title: 'Email',
    category: 'appsPages',
  },
  {
    id: 13,
    url: { name: 'apps-user-view-id', params: { id: 21 } },
    icon: 'tabler-eye',
    title: 'User View',
    category: 'appsPages',
  },
  {
    id: 15,
    url: { name: 'pages-help-center' },
    icon: 'tabler-help',
    title: 'Help Center',
    category: 'appsPages',
  },

  {
    id: 18,
    url: { name: 'pages-account-settings-tab', params: { tab: 'security' } },
    icon: 'tabler-lock-open',
    title: 'Account Settings - Security',
    category: 'appsPages',
  },
  {
    id: 19,
    url: {
      name: 'pages-account-settings-tab',
      params: { tab: 'billing-plans' },
    },
    icon: 'tabler-currency-dollar',
    title: 'Account Settings - Billing',
    category: 'appsPages',
  },
  {
    id: 20,
    url: {
      name: 'pages-account-settings-tab',
      params: { tab: 'notification' },
    },
    icon: 'tabler-bell',
    title: 'Account Settings - Notifications',
    category: 'appsPages',
  },
  {
    id: 21,
    url: { name: 'pages-account-settings-tab', params: { tab: 'connection' } },
    icon: 'tabler-link',
    title: 'Account Settings - Connections',
    category: 'appsPages',
  },

  {
    id: 62,
    url: { name: 'forms-textfield' },
    icon: 'tabler-arrow-rotary-last-left',
    title: 'TextField',
    category: 'formsTables',
  },
  {
    id: 63,
    url: { name: 'forms-select' },
    icon: 'tabler-list-check',
    title: 'Select',
    category: 'formsTables',
  },
  {
    id: 64,
    url: { name: 'forms-checkbox' },
    icon: 'tabler-checkbox',
    title: 'Checkbox',
    category: 'formsTables',
  },
  {
    id: 65,
    url: { name: 'forms-radio' },
    icon: 'tabler-circle-dot',
    title: 'Radio',
    category: 'formsTables',
  },
  {
    id: 66,
    url: { name: 'forms-combobox' },
    icon: 'tabler-checkbox',
    title: 'Combobox',
    category: 'formsTables',
  },
  {
    id: 67,
    url: { name: 'forms-date-time-picker' },
    icon: 'tabler-calendar',
    title: 'Date Time picker',
    category: 'formsTables',
  },
  {
    id: 68,
    url: { name: 'forms-textarea' },
    icon: 'tabler-forms',
    title: 'Textarea',
    category: 'formsTables',
  },
  {
    id: 70,
    url: { name: 'forms-switch' },
    icon: 'tabler-toggle-left',
    title: 'Switch',
    category: 'formsTables',
  },
  {
    id: 71,
    url: { name: 'forms-file-input' },
    icon: 'tabler-upload',
    title: 'File Input',
    category: 'formsTables',
  },
  {
    id: 72,
    url: { name: 'forms-rating' },
    icon: 'tabler-star',
    title: 'Form Rating',
    category: 'formsTables',
  },
  {
    id: 73,
    url: { name: 'forms-slider' },
    icon: 'tabler-hand-click',
    title: 'Slider',
    category: 'formsTables',
  },
  {
    id: 74,
    url: { name: 'forms-range-slider' },
    icon: 'tabler-adjustments',
    title: 'Range Slider',
    category: 'formsTables',
  },
  {
    id: 75,
    url: { name: 'forms-form-layouts' },
    icon: 'tabler-box',
    title: 'Form Layouts',
    category: 'formsTables',
  },
  {
    id: 76,
    url: { name: 'forms-form-validation' },
    icon: 'tabler-checkbox',
    title: 'Form Validation',
    category: 'formsTables',
  },
  {
    id: 77,
    url: { name: 'charts-apex-chart' },
    icon: 'tabler-chart-line',
    title: 'Apex Charts',
    category: 'chartsMisc',
  },
  {
    id: 78,
    url: { name: 'charts-chartjs' },
    icon: 'tabler-chart-area',
    title: 'ChartJS',
    category: 'chartsMisc',
  },
  {
    id: 79,
    url: { name: 'access-control' },
    icon: 'tabler-shield',
    title: 'Access Control (ACL)',
    category: 'chartsMisc',
  },
  {
    id: 81,
    url: { name: 'forms-custom-input' },
    icon: 'tabler-list-details',
    title: 'Custom Input',
    category: 'formsTables',
  },
  {
    id: 82,
    url: { name: 'forms-autocomplete' },
    icon: 'tabler-align-left',
    title: 'Autocomplete',
    category: 'formsTables',
  },
  {
    id: 83,
    url: { name: 'extensions-tour' },
    icon: 'mdi-cube-outline',
    title: 'Tour',
    category: 'userInterface',
  },
  {
    id: 88,
    url: { name: 'apps-roles' },
    icon: 'tabler-shield',
    title: 'Roles',
    category: 'appsPages',
  },

  {
    id: 90,
    url: { name: 'tables-data-table' },
    icon: 'mdi-table',
    title: 'Data Table',
    category: 'formsTables',
  },
  {
    id: 91,
    url: { name: 'tables-simple-table' },
    icon: 'mdi-table',
    title: 'Simple Table',
    category: 'formsTables',
  },
]

// ** GET Search Data
// eslint-disable-next-line sonarjs/cognitive-complexity
mock.onGet('/app-bar/search').reply(config => {
  const { q = '' } = config.params
  const queryLowered = q.toLowerCase()

  const exactData: { [k: string]: SearchItem[] } = {
    dashboards: [],
    appsPages: [],
    userInterface: [],
    formsTables: [],
    chartsMisc: [],
  }

  const includeData: { [k: string]: SearchItem[] } = {
    dashboards: [],
    appsPages: [],
    userInterface: [],
    formsTables: [],
    chartsMisc: [],
  }

  database.forEach(obj => {
    const isMatched = obj.title.toLowerCase().startsWith(queryLowered)
    if (isMatched && exactData[obj.category].length < 5)
      exactData[obj.category].push(obj)
  })

  database.forEach(obj => {
    const isMatched
      = !obj.title.toLowerCase().startsWith(queryLowered)
      && obj.title.toLowerCase().includes(queryLowered)

    if (isMatched && includeData[obj.category].length < 5)
      includeData[obj.category].push(obj)
  })

  const categoriesCheck: string[] = []

  Object.keys(exactData).forEach(category => {
    if (exactData[category].length > 0)
      categoriesCheck.push(category)
  })
  if (categoriesCheck.length === 0) {
    Object.keys(includeData).forEach(category => {
      if (includeData[category].length > 0)
        categoriesCheck.push(category)
    })
  }

  const resultsLength = categoriesCheck.length === 1 ? 5 : 3

  const mergedData: (SearchItem | SearchHeader)[] = []

  Object.keys(exactData).forEach(element => {
    if (exactData[element].length || includeData[element].length) {
      const r: (SearchItem | SearchHeader)[] = exactData[element]
        .concat(includeData[element])
        .slice(0, resultsLength)

      r.unshift({ header: element, title: element })

      mergedData.push(...r)
    }
  })

  return [200, [...mergedData]]
})
