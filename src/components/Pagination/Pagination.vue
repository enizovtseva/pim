<template lang="pug">
  .Pagination.d-inline-block
    .form-groupform-inline.mr-20.mt-5.mb-5.d-inline-block.align-middle
      select.form-control.input-sm.ml-5(name="pageSize" v-model="paginationData.pageSize" @change="changePageSize()")
        option(v-for="size in pageSizeList" :value="size") {{ size }}
        option(:value="data.length") {{ data.length }}
    ul.pagination.pagination-split.mr-20.mt-5.mb-5.d-inline-flex.align-middle
      li
        a(@click="prevPage()")
          i.fa.fa-angle-left
      li(v-for="i in paginationData.pageCount" :class="{'active': (i - 1) == paginationData.pageNumber}")
        a(@click="changePage(i)") {{ i }}
      li
        a(@click="nextPage()")
          i.fa.fa-angle-right
    .form-group.form-inline.ma-0.mt-5.mb-5.d-inline-flex.align-middle
      label Перейти
      input.form-control.input-sm.ml-5(name="toPage" style="width:50px;text-align:center;" v-model="toPage")
      button.btn.btn-success.input-sm.ml-5(@click="changePage(toPage)") OK
</template>

<script>

export default {
  name: 'Pagination',
  components: {
  },
  props: {
    paginationData: {
      type: Object,
    },
    data: {
      type: Array,
    },
  },
  data() {
    return {
      toPage: 1,
      pageSizeList: [10, 25, 50, 100],
    };
  },
  watch: {
    data: {
      immediate: true,
      handler() {
        this.changePageCount();
        this.paginatedData();
      },
    },
  },
  mounted() {
    this.changePageCount();
    this.paginatedData();
  },
  methods: {
    paginatedData() {
      const start = this.paginationData.pageNumber * this.paginationData.pageSize;
      const end = start + this.paginationData.pageSize;
      this.paginationData.result = this.data.slice(start, end);
    },
    changePageCount() {
      this.paginationData.pageCount = Math.ceil(this.data.length / this.paginationData.pageSize);
    },
    prevPage() {
      if (this.paginationData.pageNumber > 0) {
        this.paginationData.pageNumber -= 1;
      }
      this.paginatedData();
    },
    nextPage() {
      if (this.paginationData.pageNumber < this.paginationData.pageCount - 1) {
        this.paginationData.pageNumber += 1;
      }
      this.paginatedData();
    },
    changePage(page) {
      if (page > 0 && page < this.paginationData.pageCount + 1) {
        this.paginationData.pageNumber = (page - 1);
      }
      this.paginatedData();
    },
    changePageSize() {
      this.paginationData.pageNumber = 0;
      this.changePageCount();
      this.paginatedData();
    },
  },
};
</script>
