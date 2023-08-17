export default {

    props: ['field'],

    data() {
        return {
            lists: [],
        }
    },

    methods: {

        // 加载全量数据
        async loadLists(callback) {
            const _int = this.field.formatInt || false;
            const response = await Nova.request().post(this.field.options);
            const lists = response.data.resources.map(item => {
                let code = item.value || item.id;
                code = _int ? parseInt(code) : code.toString();
                if (item.parent !== null) {
                    item.parent = _int ? parseInt(item.parent) : item.parent.toString();
                }
                return {
                    key: code,
                    label: item.display || item.name,
                    parent: item.parent,
                    level: item.level
                };
            });
            callback(lists);
        },
    }
}
