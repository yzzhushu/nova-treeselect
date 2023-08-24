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
                        :lists="dataLists"
                        scrollHeight="360px"
                        style="min-height: 360px"
                    />
                </SplitterPanel>
                <SplitterPanel>
                    <Tree
                        v-model:selectionKeys="selected"
                        v-model:expandedKeys="expanded"
                        :value="nodes"
                        @nodeExpand="nextNodes"
                        selectionMode="checkbox"
                        @nodeSelect="addNode"
                        @nodeUnselect="delNode"
                        :pt="{
                            root: {
                                style: 'height: 360px'
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
            parent: {},
            selected: [],
            expanded: [],
        }
    },

    methods: {
        // 新增节点
        addNode(node) {
            this.pickNodes(node, 'add');
        },

        // 删除节点
        delNode(node) {
            this.pickNodes(node, 'del');
        },

        // 处理已选清单
        pickNodes(node, type) {
            let check = {};
            for (let code in this.selected) {
                if (this.selected[code].checked === false) continue;

                let p_code = code;
                let inList = false;
                while (this.parent[p_code] !== undefined && this.parent[p_code] !== null) {
                    p_code = this.parent[p_code];
                    if (check[p_code] === undefined) continue;
                    if (node.children === undefined && type === 'add') {
                        delete this.selected[code];
                    }
                    inList = true;
                    break;
                }
                if (!inList) check[code] = true;
            }
            this.check = check;
            this.drawTable();
        },

        // 初始化选中的分类树
        initTrees() {
            let picked = {};
            this.dataLists.map(item => {
                let child = item.key;
                picked[child] = {checked: true, partialChecked: false};
                if (item.parent === null) return;

                while (this.parent[child] !== undefined && this.parent[child] !== null) {
                    child = this.parent[child];
                    picked[child] = {checked: false, partialChecked: true};
                }
            });
            this.selected = picked;
        },

        // 节点初始化
        initNodes() {
            let nodes = [];
            const isLeaf = this.field.maxLevel || 0;
            const mixKey = this.field.nameWithCode || false;
            this.lists.map(item => {
                if (item.level !== 1) return;
                item.leaf = isLeaf === 1;
                if (mixKey) item.label = '[' + item.key + ']' + item.label;
                nodes.push(item);
            });
            this.nodes = nodes;
        },

        // 获取子节点
        nextNodes(parent) {
            const pCode = parent.key;
            const level = parent.level + 1;

            const status1 = this.selected[pCode]?.checked || false;             // 选中状态
            const status3 = this.selected[pCode] === undefined ||
                (this.selected[pCode].checked === false &&
                    this.selected[pCode].partialChecked === false);             // 未选中状态

            let nodes = [];
            const isLeaf = this.field.maxLevel || 0;
            const mixKey = this.field.nameWithCode || false;
            this.lists.map(item => {
                if (item.level !== level) return;
                if (item.parent !== pCode) return;
                item.leaf = isLeaf === item.level;
                if (item.children !== undefined) {
                    delete item.children;
                }
                if (this.expanded[item.key] !== undefined) {
                    delete this.expanded[item.key];
                }
                if (mixKey) item.label = '[' + item.key + ']' + item.label;
                nodes.push(item);
                if (status1) {
                    this.selected[item.key] = {checked: true, partialChecked: false};
                } else if (status3) {
                    delete this.selected[item.key];
                }
            });
            if (nodes.length === 0) parent.leaf = true;
            else parent.children = nodes;
        },

        // 数据初始化
        setInitialValue() {
            let that = this;
            const value = this.field.value || [];
            this.loadLists(function (lists) {
                that.lists = lists;

                let parent = {};
                lists.map(item => {
                    parent[item.key] = item.parent;
                });
                that.parent = parent;

                that.initNodes();
                if (value.length > 0) {
                    that.initCheck(value);
                    that.initTrees();
                }
            });
        },

        // 保存数据
        fill(formData) {
            formData.append(this.fieldAttribute, JSON.stringify(Object.keys(this.check)));
        },
    },
}
</script>
