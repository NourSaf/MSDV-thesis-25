<template>
  <router-view></router-view>
  <div class="pagination">
    <el-pagination 
      class=""
      layout="prev, next"
      :total="2"
      :page-size="1"
      :current-page="activeIndex"
      @current-change="handlePaginationChange"
    ></el-pagination>
  
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      activeIndex: 1,
    };
  },
  computed: {
    pathToPage() {
      return {
        '/': 1,
        '/ABubbelChart': 2,
      };
    },
    pageToPath() {
      return {
        1: '/',
        2: '/ABubbelChart',
      };
    },
  },
  watch: {
    // Watch route changes and update pagination
    $route(to) {
      const pageNum = this.pathToPage[to.path];
      if (pageNum) {
        this.activeIndex = pageNum;
      }
    }
  },
  methods: {
    handlePaginationChange(newPage) {
      const newPath = this.pageToPath[newPage];
      if (newPath && this.$route.path !== newPath) {
        this.$router.push(newPath);
      }
    }
  },
  mounted() {
    // Initialize pagination correctly based on current route
    const currentPath = this.$route.path;
    const pageNum = this.pathToPage[currentPath];
    this.activeIndex = pageNum || 1;
  }
};
</script>
<style>
.pagination{
  position: absolute;
  width: 100vw;
  height: auto;
  bottom: 20px;
  left: 0;
  right: 0;
  z-index: 100;
}
.el-pagination{
  justify-content: space-between;
}
</style>