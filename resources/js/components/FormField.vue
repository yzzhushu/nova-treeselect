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
                        :pt="{
                            root: {
                                style: 'height: 360px'
                            },
                            toggler: ({props, state, context}) => ({
                                class: context.leaf ? 'invisible' : '',
                            }),
                            checkbox: ({props, state, context}) => ({
                                class: context.checked ? 'p-tree-checked dark:p-tree-checked' : 'p-tree-unchecked dark:p-tree-unchecked'
                            })
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
            selected: [],
        }
    },

    methods: {

        // 节点初始化
        initNodes() {
            let nodes = [];
            const isLeaf = this.field.maxLevel || 0;
            this.lists.map(item => {
                if (item.level !== 1) return;
                item.leaf = isLeaf === 1;
                nodes.push(item);
            });
            this.nodes = nodes;
        },

        // 获取子节点
        loadChildNodes(parent) {
            const pCode = parent.key;
            const level = parent.level + 1;

            let nodes = [];
            const isLeaf = this.field.maxLevel || 0;
            this.lists.map(item => {
                if (item.level !== level) return;
                if (item.parent !== pCode) return;
                item.leaf = isLeaf === item.level;
                nodes.push(item);
            });
            if (nodes.length === 0) parent.leaf = true;
            else parent.children = nodes;
        },

        // 数据初始化
        setInitialValue() {
            let that = this;
            this.loadLists(function (lists) {
                that.lists = lists;
                that.initNodes();
            });

            // this.value = this.field.value || ''
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
