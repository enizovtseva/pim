<template lang="pug">
  form.table-search.mt-5.mb-5
    .input-group
      input.form-control.input-sm(type="text" name="table-search" placeholder="Найти" v-model="searchData.value")
      span.input-group-btn
        button.btn.btn-default.input-sm(type="button" @click="search(searchData.value)")
          i.zmdi.zmdi-search
</template>

<script>

export default {
  name: 'Search',
  components: {
  },
  props: {
    searchData: {
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
