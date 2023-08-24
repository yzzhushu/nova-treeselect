<template>
    <div :class="`text-${field.textAlign}`">
        <div v-if="field.value.length > 0">
            <Tooltip
                :triggers="['hover']"
                :popperTriggers="['hover']"
                placement="top"
                theme="plain"
                @show="showDataTable"
                :auto-hide="true"
                distance="6"
            >
                <template #default>
                    <span class="link-default">{{ field.displayedAs || field.value.length }}</span>
                </template>
                <template #content>
                    <HxTable
                        :columns="columns"
                        :lists="dataLists"
                        class="min-w-[24rem] max-w-2xl"
                        style="max-height: calc(360px + .5rem)"
                    />
                </template>
            </Tooltip>
        </div>
        <p v-else>&mdash;</p>
    </div>
</template>

<script>
import request from "../request";
export default {
    mixins: [request],

    mounted() {
        this.initTableHeight();
    }
}
</script>
