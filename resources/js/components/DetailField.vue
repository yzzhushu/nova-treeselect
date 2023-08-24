<template>
    <PanelItem :index="index" :field="field">
        <template #value>
            <div class="flex flex-wrap gap-2">
                <HxTable
                    :columns="columns"
                    :lists="dataLists"
                    scrollHeight="360px"
                    class="min-w-[24rem] max-w-2xl"
                    style="max-height: calc(360px + .5rem)"
                />
            </div>
        </template>
    </PanelItem>
</template>

<script>
import request from "../request";
export default {
    mixins: [request],

    mounted() {
        this.showDataTable();
    },
}
</script>
