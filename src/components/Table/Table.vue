<template lang="pug">
  table.table.mb-0
    thead
      tr
        th(v-for="(col, i) in tableData.columns" :class="{'text-center': i != 0}") {{ col.title }}
    tbody
      tr(v-for="measurement in data" v-bind:key="measurement.id")
        td(v-for="(col, i) in tableData.columns" :class="{'text-center': i != 0}")
          a(v-if="col.url" :href="`${col.url}?id=${measurement.id}`") {{measurement[col.id]}}
          template(v-if="!col.url") {{measurement[col.id]}}
          template(v-if="col.id === 'edit'")
            a(@click="editMeasure(measurement)")
              i.fa.fa-pencil
          template(v-if="col.id === 'delete'")
            a(@click="deleteMeasure(measurement.id)")
              i.fa.fa-trash-o.txt-danger
</template>

<script>

export default {
  name: 'Table',
  components: {
  },
  props: {
    tableData: {
      type: Object,
    },
    data: {
      type: Array,
    },
  },
  data() {
    return {
    };
  },
  methods: {
    search(value) {
      this.searchData.result = this.data.filter((item) => {
        let res = false;
        this.searchData.fields.forEach((field) => {
          res = res || (item[field] && item[field].toLowerCase().includes(value.toLowerCase()));
        });
        return res;
      });
      this.$root.$emit('afterSearch');
    },
  },
};
</script>
