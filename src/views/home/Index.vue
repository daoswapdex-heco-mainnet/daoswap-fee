<script>
// Extensions
import View from "@/views/View";

export default {
  name: "Home",

  metaInfo: { title: "Home" },

  extends: View,

  props: {
    id: {
      type: String,
      default: "home"
    }
  }
};
</script>
