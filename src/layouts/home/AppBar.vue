<template>
  <div>
    <v-app-bar
      id="home-app-bar"
      app
      elevation="1"
      elevate-on-scroll
      height="80"
    >
      <base-img
        :src="
          require(`@/assets/logo-${
            $vuetify.theme.isDark ? 'dark' : 'light'
          }.png`)
        "
        contain
        max-width="46"
        width="100%"
      />

      <v-spacer />

      <div>
        <v-tabs
          class="hidden-sm-and-down"
          optional
          background-color="transparent"
        >
          <v-tab
            to="/usdt-dao"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("USDT-DAO") }}</v-tab
          >
          <v-tab
            to="/usdt-hfil"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("USDT-HFIL") }}</v-tab
          >
          <v-tab
            to="/usdt-eth"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("USDT-ETH") }}</v-tab
          >
        </v-tabs>
      </div>

      <v-app-bar-nav-icon class="hidden-md-and-up" @click="drawer = !drawer" />

      <!-- 多语言切换 -->
      <!-- <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">
            <v-icon>mdi-translate</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="item in localeList" :key="item.locale" link>
            <v-list-item-title
              v-text="item.title"
              @click="changeLang(item.locale)"
            ></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-list shaped>
        <v-list-item-group v-model="group" color="#93B954">
          <v-list-item to="/usdt-dao">
            <v-list-item-title>{{ $t("USDT-DAO") }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/usdt-hfil">
            <v-list-item-title>{{ $t("USDT-HFIL") }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/usdt-eth">
            <v-list-item-title>{{ $t("USDT-ETH") }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
export default {
  name: "HomeAppBar",

  data: () => ({
    // 当前包含语言
    localeList: [
      {
        locale: "zh",
        title: "中文"
      },
      {
        locale: "en",
        title: "English"
      }
    ],
    // 导航
    drawer: false,
    group: null,
    items: ["Home", "Pro"]
  }),
  methods: {
    changeLang(locale) {
      this.$i18n.locale = locale;
    }
  }
};
</script>

<style lang="sass">
#home-app-bar
  .v-tabs-slider
    max-width: 24px
    margin: 0 auto

  .v-tab
    &::before
      display: none
</style>
