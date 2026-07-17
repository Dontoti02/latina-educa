export const PaymentConceptsContents  = {
    table: {
      headers : [
        { title: 'NOMBRE', 
          key: 'name', 
          align:'left',
          fixed: true
        },
        { 
          title: 'CÓDIGO', 
          key: 'code',
          nowrap: true
        },
        { 
          title: 'MONTO BRUTO', 
          key: 'gross_amount',
          align: 'right',
          nowrap: true
        },
        { 
          title: 'MONTO IGV', 
          key: 'igv_amount',
          align: 'right',
          nowrap: true
        },
        { 
          title: 'MONTO NETO', 
          key: 'net_amount',
          align: 'right',
          nowrap: true
        },
        { 
          title: 'MÁXIMO DE CUOTAS', 
          key: 'maxQuotas', 
          nowrap: true,
          align: 'right' 
        },
        { 
          title: 'TIPO DE PAGO', 
          key: 'canBePaidInQuotas' 
        },
        {
          title: 'FECHA DE CREACIÓN',
          key: 'createdAt',
          align: 'center',
          nowrap: true
        },
        {
         title: 'FECHA DE ACTUALIZACIÓN',
          key: 'updatedAt',
          align: 'center',
          nowrap: true
        },
        {
          title: 'ESTADO',
          key: 'isActive',
          align: 'center',
        },
        { 
          title: '', 
           key: 'actions',
           align: 'center'
        }
      ]
    }
}
