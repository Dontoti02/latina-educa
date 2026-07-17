<script>
import { debounce } from "lodash";
import paymentTable from "./paymentTable.vue";
import { treasuryService } from "@/services/treasury.service";
import NewPaymentModal from "./modals/newPaymentModal.vue";
import RegisterPaymentModal from "./modals/registerPaymentModal.vue";

export default {
  components: {
    paymentTable,
    NewPaymentModal,
    RegisterPaymentModal,
  },
  data: () => ({
    student: null,
    students: [],
    studentsData: [],
    movements: [],
    paidMovements: [],
    dueMovements: [],
    actualPeriodDue:{
      end_date: "2025-08-10 00:00:00",
      id: -1, 
      name: "2024-1",
      start_date : "2025-01-01 00:00:00",
      status : "SIN TERMINO"
    },
    actualPeriodDueIndex:0,
    actualPeriodPaid: {
      end_date: "2025-08-10 00:00:00",
      id: -1, 
      name: "2024-1",
      start_date : "2025-01-01 00:00:00",
      status : "SIN TERMINO"
    },
    actualPeriodPaidIndex:0,
    lastPeriod:0,
    periods: [],
    searchInput: "",
    personId: null,
    page: 1,
    itemsPerPage: 10,
    showModal: false,
    showRegisterPaymentModal: false,
    movementId: -1,
  }),
  emits: ["nextStep", ("continue", "personId")],
  methods: {
    async updateQuery(is_paid) {
      if(is_paid === 0){
        treasuryService
        .getMovements(
          this.personId,
          0,
          this.page,
          this.itemsPerPage,
          this.type,
          this.actualPeriodDue.id
        )
        .then((value) => {
          this.dueMovements = value.data;
          });
      }
      else{
        treasuryService
        .getMovements(
          this.personId,
          1,
          this.page,
          this.itemsPerPage,
          this.type,
          this.actualPeriodPaid.id
        )
        .then((value) => {
          this.paidMovements = value.data;
        });
      }
      
    },
    async updateTables(){
      this.updateQuery(0);
      this.updateQuery(1);
    },
    async openRegisterPaymentModal(data) {
      this.movementId = Number(data);
      this.showRegisterPaymentModal = true;
    },
    async nextDue(page) {
      this.page = page;
      console.log("pagina", this.page);
      this.updateQuery(0);
    },
    async changeItemsDue(itemsPerPage) {
      this.itemsPerPage = itemsPerPage;
      this.updateQuery(0);
    },
    async filterTypeDue(type) {
      this.type = type;
      this.updateQuery(0);
    },
    async nextPaid(page) {
      this.page = page;
      console.log("pagina", this.page);
      this.updateQuery(1);
    },
    async nextPeriodDue() {
      if(this.actualPeriodDueIndex >= this.lastPeriod)return;
      this.actualPeriodDue = this.periods[this.actualPeriodDueIndex+1];
      this.actualPeriodDueIndex++;
      this.updateQuery(0);
    },
    async prevPeriodDue() {
      if(this.actualPeriodDueIndex <= 0)return;
      this.actualPeriodDue = this.periods[this.actualPeriodDueIndex-1];
      this.actualPeriodDueIndex--;
      this.updateQuery(0);
    },
    async nextPeriodPaid() {
      if(this.actualPeriodPaidIndex >= this.lastPeriod)return;
      this.actualPeriodPaid = this.periods[this.actualPeriodPaidIndex+1];
      this.actualPeriodPaidIndex++;
      this.updateQuery(1);
    },
    async prevPeriodPaid() {
      if(this.actualPeriodPaidIndex <= 0)return;
      this.actualPeriodPaid = this.periods[this.actualPeriodPaidIndex-1];
      this.actualPeriodPaidIndex--;
      this.updateQuery(1);
    },
    async changeItemsPaid(itemsPerPage) {
      this.itemsPerPage = itemsPerPage;
      this.updateQuery(1);
    },
    async filterTypePaid(type) {
      this.type = type;
      this.updateQuery(1);
    },
    async searchStudent(input) {
      treasuryService.searchStudent(input).then((value) => {
        this.studentsData = value.data;
        this.students = value.data.map((student) => student.names);
      });
    },
    onInput(value) {
      if (value.data === null) {
        this.searchInput = this.searchInput.slice(0, -1);
      } else if (value.data === " ") {
        this.searchInput += " ";
      } else {
        this.searchInput += value.data;
      }
      this.debouncedSearch(this.searchInput);
    },
    clearSearchInput() {
      this.searchInput = "";
      this.student = null;
    }
  },
  created() {
    this.debouncedSearch = debounce(this.searchStudent, 1000);
  },
  watch: {
    student(newVal) {
      const selectedStudent = this.studentsData.find(
        (student) => student.names === newVal
      );
      this.personId = selectedStudent.person_id;
      treasuryService
        .getMovements(this.personId,0, this.page, this.itemsPerPage)
        .then((value) => {
          this.dueMovements = value.data;
          this.periods = value.data.periods;
          this.lastPeriod = this.periods.length - 1;
          this.actualPeriodDue = this.periods[0];
        });
      treasuryService
        .getMovements(this.personId,1, this.page, this.itemsPerPage)
        .then((value) => {
          this.paidMovements = value.data;
          this.actualPeriodPaid = this.periods[0];
        });
    },
  },
};
</script>

<template>
  <div>
    <div v-if="loadingFilters" class="mt-4 w-100 d-flex justify-center">
      <VRow>
        <VCol cols="12">
          <VSkeletonLoader class="w-100 gap-4" type="image" />
        </VCol>
        <VCol cols="12">
          <VSkeletonLoader
            class="w-100 gap-4"
            type="list-item,list-item,article,article,article"
          />
        </VCol>
      </VRow>
    </div>
    <div v-else>
      <VCard>
        <VRow class="">
          <VCol cols="2" class="pl-8 pt-6 pb-0">
            <img :src="BulbLightImg" height="100" />
          </VCol>
          <VCol
            cols="8"
            class="pt-6 px-8 d-flex text-center justify-center align-center flex-column"
          >
            <VRow align="center" justify="center" class="mx-0 my-0 w-100">
              <VCol cols="12" class="py-0">
                <h1>Pagos</h1>
                <p class="my-0">
                  Busca al estudiante y consulta su historial de pagos.
                </p>
              </VCol>
            </VRow>
          </VCol>
          <VCol cols="2" class="pb-0 d-flex justify-end align-end">
            <img :src="PencilRocketImg" height="140" />
          </VCol>
        </VRow>
      </VCard>
      <VSpacer />
      <VCard flat class="mt-6 py-4 pl-6 pr-6 justify-center">
        <VRow justify="space-between" class="mx-0">
          <VCol cols="12" md="12">
            <v-autocomplete
              label="Busqueda de estudiantes"
              :items="students"
              v-model="student"
              :oninput="onInput"
              @click:clear="clearSearchInput"
              clearable
            ></v-autocomplete>
            <v-alert type="warning" variant="outlined" class="mt-4" closable>
            Primero debe buscar y seleccionar un estudiante antes de poder visualizar o registrar un nuevo pago.
          </v-alert>
          </VCol>
        </VRow>
      </VCard>
      <VSpacer />
      <VCard flat class="mt-6 py-4">
        <VRow>
          <VCol v-if="actualPeriodDue">
            <h1 class="text-center">Pagos Pendientes - Periodo {{ actualPeriodDue.name }}</h1>
            <paymentTable
              v-if="movements !== null"
              :movements="dueMovements"
              :personId="personId"
              :period="actualPeriodDueIndex"
              :lastPeriod="lastPeriod"
              :is_paid="false"
              @update:page="nextDue"
              @changeItems="changeItemsDue"
              @changeType="filterTypeDue"
              @newPayment="showModal = true"
              @registerPayment="openRegisterPaymentModal"
              @nextPage="nextPeriodDue"
              @previousPage="prevPeriodDue"
            ></paymentTable>
          </VCol>
        </VRow>
      </VCard>
      <VCard flat class="mt-6 py-4">
        <VRow>
          <VCol v-if="actualPeriodPaid">
            <h1 class="text-center">Pagos Realizados - Periodo {{ actualPeriodPaid.name }}</h1>
            <paymentTable
              v-if="movements !== null"
              :movements="paidMovements"
              :period="actualPeriodPaidIndex"
              :lastPeriod="lastPeriod"
              :personId="personId"
              :is_paid="true"
              @update:page="nextPaid"
              @changeItems="changeItemsPaid"
              @changeType="filterTypePaid"
              @newPayment="showModal = true"
              @registerPayment="openRegisterPaymentModal"
              @nextPage="nextPeriodPaid"
              @previousPage="prevPeriodPaid"
            ></paymentTable>
          </VCol>
        </VRow>
      </VCard>
    </div>
    <NewPaymentModal
      :show="showModal"
      @close="showModal = false"
      @register="updateTables"
      :personId="personId"
    ></NewPaymentModal>
    <RegisterPaymentModal
      :show="showRegisterPaymentModal"
      @close="showRegisterPaymentModal = false"
      @register="updateTables"
      :movementId="movementId"
    ></RegisterPaymentModal>
  </div>
</template>

<style lang="scss">
.table-data-users {
  .v-data-table__thead {
    display: none !important;
  }
}
</style>

<route lang="yaml">
meta:
  action: read
  subject: UsersList
</route>
