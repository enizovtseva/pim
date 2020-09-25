<template lang="pug">
  span.icon(:class="optionClass")
    svg(:width="width", :height="height")
      use(:xlink:href="'#' + hash")
</template>

<script>

export default {
  name: 'Icon',
};
</script>
