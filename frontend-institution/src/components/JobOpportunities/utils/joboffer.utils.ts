import { JobOfferFiltersResponse } from "@/models/job-opportunities/job-offer"
import { DateFormatting } from "@/utils/date-formatting"

export const DEFAULT_JOB_OFFER_LIST_FILTERS : JobOfferFiltersResponse = {
  categories: [],
  contractTypes: [],
  locations: [],
  schedules: [],
  companies: [],
  salaryRanges: [],
  dateFilters: [],
  orderBy: [],
  departments: [],
  provincies: [],
  isAdmin: false,
} as const


export const DEFAULT_JOB_OFFER_FILTERS_FORM = {
  orderBy: null,
  categoryId: null,
  dateFilter: null,
  salary: null,
  scheduleId: null,
  locationId: null,
  contractTypeId: null,
  province: null,
  companyId: null,
  search: null,
  perPage: 20,
  page: 1,
} as const

export const DEFAULT_JOB_OFFER_CREATE_FORM = {
  title: null,
  description: "<br>",
  requirements: "<br>",
  benefits: "<br>",
  companyId: null,
  categoryId: null,
  contractTypeId: null,
  locationId: null,
  scheduleId: null,
  salary: 0,
  salaryCurrency: "SOL",
  address: "",
  department: "",
  province: "",
  country: "PERÚ",
  publicationDate: DateFormatting.formatDateTimePickerComponent(),
  attachments : null
} as const
