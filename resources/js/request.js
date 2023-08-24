export default {

    props: ['index', 'field'],

    data() {
        return {
            lists: [],
            check: {},
            dataLists: [],
        }
    },

    computed: {
        columns() {
            return this.field.columns;
        },

        initScrollHeight() {
            const value = this.field.value || [];
            return Math.min((value.length + 1) * 40, 360) + 'px';
        }
    },

    methods: {
        // index和detail页面用
        showDataTable() {
            if (this.lists.length > 0) return;
            let that = this;
            this.loadLists(function (lists) {
                that.lists = lists;
                const value = that.field.value || [];
                if (value.length > 0) {
                    that.initCheck(value);
                }
            });
        },

        // 初始化已选中的数据
        initCheck(value) {
            if (value.length === 0) return;
            value.map(item => {
                this.check[item] = true;
            });
            this.drawTable();
        },

        // 绘制dataTable
        drawTable() {
            let table = [];
            this.lists.map(item => {
                if (this.check[item.key] === undefined) return;
                table.push(item);
            });
            this.dataLists = table;
        },

        // 加载全量数据
        async loadLists(callback) {
            const _int = this.field.formatInt || false;
            const response = await Nova.request().post(this.field.options);
            const lists = response.data.resources.map(item => {
                let code = item.value || item.id;
                code = _int ? parseInt(code) : code.toString();

                let p_code = item.parent || null;
                if (p_code !== null) p_code = _int ? parseInt(p_code) : p_code.toString();

                const level = item.level || 1;
                const name = item.display || item.name;

                ['display', 'name', 'value', 'id', 'parent', 'level'].map(key => {
                    if (item[key] !== undefined) delete item[key];
                });
                return {
                    key: code, label: name, parent: p_code, level: level,
                    ...item
                };
            });
            callback(lists);
        },
    }
}
