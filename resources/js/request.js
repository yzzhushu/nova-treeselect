export default {

    props: ['field'],

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
        }
    },

    methods: {
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
            const _pre = this.field.nameWithCode || false;
            const response = await Nova.request().post(this.field.options);
            const lists = response.data.resources.map(item => {
                let code = item.value || item.id;
                code = _int ? parseInt(code) : code.toString();

                let p_code = item.parent || null;
                if (p_code !== null) p_code = _int ? parseInt(p_code) : p_code.toString();

                const level = item.level || 1;
                const name = (_pre ? ('[' + code + ']') : '') + (item.display || item.name);

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
