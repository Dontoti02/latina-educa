<template>
    <ModalBasic
        :visible="show"
        is-persistent
        width="500"
        is-scrollable
    >
    <VCard>
      <VToolbar
      >
        <VToolbarTitle>
          {{ 'Eliminar Concepto de Pago' }}
        </VToolbarTitle>
        <VSpacer />
        <VBtn
          icon
          @click="closeModal"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
    </VToolbar>
    
      <div class="modal-content">
        <p v-if="movements.length != 0">
            Este concepto tiene {{ movements.length }} movimientos asociados con los siguientes usuarios:
            <ul class="user-list">
              <li v-for="user in uniqueUsers" :key="user" class="user-list-item">{{ user }}</li>
            </ul>
        </p>
        <p>
            ¿Está seguro que desea eliminar el concepto de pago: <strong>{{ item.name }}</strong>?, esto no eliminara los movimientos asociados.
        </p>
        <div class="modal-actions">
            <button class="confirm-button" @click="confirmDeletion">Confirmar</button>
            <button class="cancel-button" @click="closeModal">Cancelar</button>
        </div>
      </div>
    </VCard>
    </ModalBasic>
</template>

<script>
import ModalBasic from '@/common/components/Modal.vue'
export default {
    name: 'DeletePaymentConceptModal',
    components: {
        ModalBasic
    },
    props: {
        movements: {
            type: Object,
            required: true
        },
        uniqueUsers: {
            type: Array,
            required: true
        },
        item: {
            type: Object,
            required: true
        },
        show: {
            type: Boolean,
            required: true
        }
    },
    methods: {
        confirmDeletion() {
            this.$emit('confirm');
        },
        closeModal(){
            this.$emit('close');
        }
    }
};
</script>

<style>
  .modal-content {
    max-width: 500px;
    margin: auto;
    padding: 20px;
    background-color: unset;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
    color: unset;
  }

  .modal-content p {
    margin-bottom: 20px;
    line-height: 1.6;
    font-size: 16px;
  }

  .modal-content strong {
    color: #d9534f; /* Destaca el concepto en un color rojo */
  }

  .user-list {
    padding-left: 20px;
    margin: 10px 0;
  }

  .user-list-item {
    list-style-type: disc;
    margin-bottom: 5px;
    font-size: 14px;
    color: unset;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .confirm-button,
  .cancel-button {
    padding: 10px 15px;
    font-size: 14px;
    font-weight: bold;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .confirm-button {
    background-color: #d9534f;
    
    color: #ffffff;
    transition: background-color 0.3s;
  }

  .confirm-button:hover {
    background-color: #c9302c;
  }

  .cancel-button {
    background-color: unset;
    color:unset;
    transition: background-color 0.3s;
  }

  .cancel-button:hover {
    background-color: unset;
  }

  /* Responsivo */
  @media (max-width: 600px) {
    .modal-content {
      padding: 15px;
      font-size: 14px;
    }

    .modal-actions {
      flex-direction: column;
      gap: 5px;
    }

    .confirm-button,
    .cancel-button {
      width: 100%;
    }
  }
</style>

