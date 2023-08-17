export default {

    props: ['field'],

    data() {
        return {
            lists: [],
        }
    },

    computed: {
        columns() {
            return this.field.columns;
        }
    },

    methods: {

        // 加载全量数据
        async loadLists(callback) {
            const _int = this.field.formatInt || false;
            const _pre = this.field.nameWithCode || false;
            const response = await Nova.request().post(this.field.options);
            const lists = response.data.resources.map(item => {
                let code = item.value || item.id;
                code = _int ? parseInt(code) : code.toString();
                if (item.parent !== null) {
                    item.parent = _int ? parseInt(item.parent) : item.parent.toString();
                }
                let name = (_pre ? ('[' + code + ']') : '') + (item.display || item.name);
                return {
                    key: code,
                    label: name,
                    parent: item.parent,
                    level: item.level
                };
            });
            callback(lists);
        },
    }
}
