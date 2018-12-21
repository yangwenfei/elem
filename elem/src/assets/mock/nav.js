const navData = [{
    code: 'plan',
    text: '物资计划管理',
    deployLevel: ['group', 'general-project', 'company', 'mixing-station'],
    children: [{
        code: 'allplan',
        text: '总需用计划',
        deployLevel: ['group', 'company', 'general-project']
      },
      {
        code: 'yearplan',
        text: '年度需用计划',
        deployLevel: ['group', 'company', 'general-project']
      },
      {
        code: 'monthplan',
        text: '月度需用计划',
        deployLevel: ['group', 'company', 'general-project', 'mixing-station']
      }
    ]
  },
  {
    code: 'purchase',
    text: '物资采购管理',
    deployLevel: ['group', 'company', 'general-project', 'mixing-station'],
    children: [{
        code: 'contract',
        text: '采购合同',
        deployLevel: ['group', 'company', 'general-project', 'mixing-station']
      },
      {
        code: 'order',
        text: '采购订单',
        deployLevel: ['general-project', 'mixing-station']
      },
      {
        code: 'receiveBill',
        text: '收料单',
        deployLevel: ['general-project', 'mixing-station']
      },
      {
        code: 'check',
        text: '点验单',
        deployLevel: ['general-project', 'mixing-station']
      },
      {
        code: 'pre-check',
        text: '预点单',
        deployLevel: ['general-project', 'mixing-station']
      },
      {
        code: 'offset',
        text: '冲预点单',
        deployLevel: ['general-project', 'mixing-station']
      },
      {
        code: 'out-stock',
        text: '出库单',
        deployLevel: ['general-project']
      },
      {
        code: 'settlement',
        text: '结算单',
        deployLevel: ['general-project']
      },
      {
        code: 'house-inventory',
        text: '库房盘点表',
        deployLevel: ['company','general-project']
      }
    ]
  }
]

export default navData
