<template>
    <DefaultField
        :field="field"
        :errors="errors"
        :show-help-text="showHelpText"
        :full-width-content="fullWidthContent"
    >
        <template #field>
            <Splitter
                style="height: calc(360px + .5rem)"
                :class="errorClasses"
            >
                <SplitterPanel>
                    <HxTable
                        :columns="columns"
                        :lists="lists"
                        style="min-height: 360px"
                    />
                </SplitterPanel>
                <SplitterPanel>
                    <Tree
                        v-model:selectionKeys="selected"
                        :value="nodes"
                        @node-expand="loadChildNodes"
                        selectionMode="checkbox"
                        @nodeSelect="getSelected"
                        @nodeUnselect="getSelected"
                        :pt="{
                            root: {
                                style: 'max-height: 360px'
                            }
                        }"
                    />
                </SplitterPanel>
            </Splitter>
        </template>
    </DefaultField>
</template>

<script>
import {FormField, HandlesValidationErrors} from 'laravel-nova';
import request from "../request";

export default {
    mixins: [FormField, HandlesValidationErrors, request],

    data() {
        return {
            nodes: [],
        }
    },

    methods: {

        // 节点初始化
        initNodes() {
            let nodes = [];
            this.lists.map(item => {
                if (item.level !== 1) return;
                nodes.push(item);
            });
            this.nodes = nodes;
        },

        // 获取子节点
        loadChildNodes(parent) {
            if (parent !== null && parent.children !== undefined) return;
            const p_code = parent === null ? '' : parent.key;

            let nodes = [];
            for (let code in this.lists) {
                if (code.length !== p_code.length + 2) continue;
                if (p_code !== '' && !code.startsWith(p_code)) continue;
                nodes.push({key: code, label: '[' + code + ']' + this.lists[code], leaf: code.length >= 8});
            }
            if (parent === null) return this.nodes = nodes;

            if (nodes.length === 0) parent.leaf = true;
            else parent.children = nodes;
        },

        // 循环获取子节点，由于性能问题暂且弃用
        getChildNodes(nodes, parent_code) {
            for (let code in this.lists) {
                if (code.length !== (parent_code === null ? 0 : parent_code.length) + 2) continue;
                if (parent_code !== null && !code.startsWith(parent_code)) continue;

                let param = {key: code, label: '[' + code + ']' + this.lists[code]};
                if (parent_code === null || parent_code.length <= 6) {
                    param.children = this.getChildNodes([], code);
                }
                nodes.push(param);
            }
            return nodes;
        },


        // 数据初始化
        setInitialValue() {
            let that = this;
            this.loadLists(function (lists) {
                that.lists = lists;
                that.initNodes();
            });

            this.value = this.field.value || ''
        },

        /**
         * Fill the given FormData object with the field's internal value.
         */
        fill(formData) {
            formData.append(this.fieldAttribute, this.value || '')
        },
    },
}
</script>
